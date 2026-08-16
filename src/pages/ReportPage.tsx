import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import { PhotoUploader } from '../components/ui/PhotoUploader';
import { DuplicateWarning } from '../components/issue/DuplicateWarning';
import { useGeolocation } from '../services/geolocation/useGeolocation';
import { reverseGeocode } from '../utils/geoUtils';
import { useDuplicateCheck } from '../hooks/useDuplicateCheck';
import { useStore, useIssues } from '../store';
import type { IssueCategory, IssueSeverity, GeoPoint } from '../types/issue';
import { ISSUE_CATEGORY_LABELS } from '../types/issue';

interface FormState {
  photos: File[];
  title: string;
  description: string;
  category: IssueCategory | '';
  severity: IssueSeverity | '';
  location: GeoPoint | null;
  address: string;
}

const initialForm: FormState = { photos: [], title: '', description: '', category: '', severity: '', location: null, address: '' };

// Fallback location used when geolocation is unavailable/denied but user provides an address manually
const FALLBACK_LOCATION: GeoPoint = { lat: 28.6139, lng: 77.2090 }; // New Delhi

export const ReportPage = () => {
  const navigate = useNavigate();
  const createIssue = useStore((s) => s.createIssue);
  const existingIssues = useIssues();
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState<'photo' | 'details' | 'review'>('photo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);

  // Cache of file -> object URL so each photo only gets ONE preview URL (no leaks)
  const previewUrlsRef = useRef<Map<File, string>>(new Map());
  const createPreviewUrl = useCallback((file: File) => {
    const cached = previewUrlsRef.current.get(file);
    if (cached) return cached;
    const url = URL.createObjectURL(file);
    previewUrlsRef.current.set(file, url);
    return url;
  }, []);

  // Revoke all preview object URLs when the component unmounts to prevent memory leaks
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const { isChecking: isCheckingDuplicates, duplicates, hasChecked: hasCheckedDuplicates, checkForDuplicates, reset: resetDuplicates } = useDuplicateCheck();
  const { location: gpsLocation, isLoading: gpsLoading, error: gpsError, requestLocation } = useGeolocation();

  // Request location on mount to preserve existing auto-detect behavior
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (gpsLocation && !gpsLoading) {
      setForm((prev) => ({ ...prev, location: gpsLocation }));
      setIsDetectingLocation(true);
      let cancelled = false;
      reverseGeocode(gpsLocation).then((address) => {
        if (cancelled) return;
        setForm((prev) => ({ ...prev, address }));
        setIsDetectingLocation(false);
      });
      return () => { cancelled = true; };
    } else if (!gpsLoading && gpsError) { setIsDetectingLocation(false); }
  }, [gpsLocation, gpsLoading, gpsError]);

  const handlePhotoCapture = useCallback(async (file: File) => {
    setForm((prev) => ({ ...prev, photos: [...prev.photos, file] }));
    setIsAnalyzingImage(true);
    setStep('details');
    if (file) {
      try {
        const { aiService } = await import('../services/ai/ai');
        if (aiService.isConfigured()) {
          const result = await aiService.analyzeImage(file);
          if (result) {
            setForm((prev) => ({
              ...prev,
              category: result.suggestedCategory,
              severity: result.severity,
              title: result.suggestedTitle || prev.title,
              // Only use AI-generated description if the user hasn't typed their own
              description: !prev.description && !result.description.startsWith('Could not analyze') ? result.description : prev.description,
            }));
          }
        }
      } catch { /* AI unavailable */ }
      finally { setIsAnalyzingImage(false); }
    }
  }, []);

  // Note: form.title/description/category/severity are intentionally NOT in the deps
  // so the expensive duplicate/AI scan only runs once when photos + location are set,
  // instead of re-firing on every keystroke while the user edits the form.
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step === 'details' && form.photos.length > 0 && form.location && !hasCheckedDuplicates && !isCheckingDuplicates) {
      checkForDuplicates({ title: form.title || 'New Issue', description: form.description, category: (form.category || 'other') as IssueCategory, severity: (form.severity || 'medium') as IssueSeverity, location: form.location, address: form.address, localityId: 'custom-locality', photos: form.photos }, existingIssues);
    }
  }, [step, form.photos.length, form.location, hasCheckedDuplicates, isCheckingDuplicates, checkForDuplicates, existingIssues]);

  const handleRemovePhoto = useCallback((index: number) => {
    setForm((prev) => {
      const removed = prev.photos[index];
      if (removed) {
        // Revoke and remove the cached preview URL for this photo
        const url = previewUrlsRef.current.get(removed);
        if (url) {
          URL.revokeObjectURL(url);
          previewUrlsRef.current.delete(removed);
        }
      }
      return { ...prev, photos: prev.photos.filter((_, i) => i !== index) };
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.severity || !form.location) return;
    setIsSubmitting(true);
    const newIssue = await createIssue({
      title: form.title,
      description: form.description,
      category: form.category as IssueCategory,
      severity: form.severity as IssueSeverity,
      location: form.location,
      address: form.address || 'Location detected',
      localityId: 'custom-locality',
      photos: form.photos,
    });
    setIsSubmitting(false);
    if (newIssue) {
      useStore.getState().showToast('Issue reported successfully!', 'success');
      navigate(`/issue/${newIssue.id}`);
    } else {
      useStore.getState().showToast('Failed to report issue. Please try again.', 'error');
    }
  };

  const categories: IssueCategory[] = ['roads', 'garbage', 'water_leakage', 'street_lights', 'sewage', 'encroachment', 'parks', 'public_safety', 'other'];
  const severities: IssueSeverity[] = ['low', 'medium', 'high', 'critical'];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-page)]">
      <TopBar title="Report Issue" showBack rightAction={step !== 'photo' ? <button onClick={() => setStep('photo')} className="text-xs uppercase tracking-wider text-[var(--accent)] font-medium">Retake</button> : undefined} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding)] py-6 space-y-6">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-2">
            {['photo', 'details', 'review'].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`stamp ${step === s ? 'bg-[var(--text-primary)] text-[var(--bg-surface)]' : ''}`}>{i + 1}</div>
                {i < 2 && <div className={`w-6 h-px ${['photo', 'details', 'review'].indexOf(step) > i ? 'bg-[var(--text-primary)]' : 'bg-[var(--border)]'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Photo */}
          {step === 'photo' && (
            <div className="space-y-5">
              <Card padding="lg" className="text-center">
                <div className="text-3xl mb-3 font-serif">📸</div>
                <CardTitle className="mb-2">Take a Photo</CardTitle>
                <p className="text-sm text-[var(--text-secondary)] mb-6">Capture the issue. We'll analyze it automatically.</p>
                <PhotoUploader onPhotoCapture={handlePhotoCapture}>
                  <div className="flex flex-col items-center justify-center w-full h-40 border border-dashed border-[var(--border)] bg-[var(--bg-muted)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
                    <span className="text-sm font-medium text-[var(--accent)]">Tap to Open Camera</span>
                    <span className="text-xs text-[var(--text-muted)] mt-1">or choose from gallery</span>
                  </div>
                </PhotoUploader>
              </Card>
              {form.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {form.photos.map((photo, i) => (
                    <div key={i} className="relative aspect-square border border-[var(--border)] bg-[var(--bg-muted)] overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
                      <img src={createPreviewUrl(photo)} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => handleRemovePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[10px]" style={{ borderRadius: 'var(--radius-sm)' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full" size="lg" disabled={form.photos.length === 0} onClick={() => setStep('details')}>Continue</Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-5">
              {isDetectingLocation && <div className="text-sm text-[var(--text-muted)] flex items-center gap-2"><span className="inline-block w-3 h-3 border border-[var(--text-muted)] border-t-[var(--text-primary)] animate-spin" style={{ borderRadius: '50%' }} /> Detecting your location...</div>}
              {gpsError && !gpsLoading && <div className="text-sm text-[var(--status-yellow)]">Could not auto-detect location. Enter it manually below.</div>}
              {form.location && !isDetectingLocation && <div className="text-sm text-[var(--status-green)]">Location detected: {form.address || 'Ready'}</div>}
              {isAnalyzingImage && <div className="text-sm text-[var(--text-muted)] flex items-center gap-2"><span className="inline-block w-3 h-3 border border-[var(--text-muted)] border-t-[var(--text-primary)] animate-spin" style={{ borderRadius: '50%' }} /> AI analyzing your image...</div>}
              {!isAnalyzingImage && form.category && form.severity && form.photos.length > 0 && <div className="text-sm text-[var(--text-muted)]">AI suggested category & severity from your photo</div>}

              {!showDuplicates && hasCheckedDuplicates && duplicates.length > 0 && (
                <DuplicateWarning duplicates={duplicates} isChecking={isCheckingDuplicates} onProceed={() => { setShowDuplicates(false); resetDuplicates(); }} onAddPhoto={() => setStep('photo')} onAddUpdate={() => {}} />
              )}

              <Card>
                <CardTitle className="mb-3">Category</CardTitle>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
                      className={`p-3 text-sm border text-left transition-colors ${form.category === cat ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] border-[var(--text-primary)]' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-primary)]'}`}
                      style={{ borderRadius: 'var(--radius-sm)' }}>
                      {ISSUE_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <CardTitle className="mb-3">Severity</CardTitle>
                <div className="grid grid-cols-2 gap-2">
                  {severities.map((sev) => (
                    <button key={sev} onClick={() => setForm((prev) => ({ ...prev, severity: sev }))}
                      className={`p-3 text-sm border text-left transition-colors ${form.severity === sev ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] border-[var(--text-primary)]' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-primary)]'}`}
                      style={{ borderRadius: 'var(--radius-sm)' }}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <CardTitle className="mb-3">Title</CardTitle>
                <input type="text" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="What's the issue?" autoFocus
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--text-primary)] transition-colors" style={{ borderRadius: 'var(--radius-sm)' }} />
              </Card>

              <Card>
                <CardTitle className="mb-3">Description</CardTitle>
                <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Add more details (optional)..." rows={3}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--text-primary)] transition-colors resize-none" style={{ borderRadius: 'var(--radius-sm)' }} />
              </Card>

              <Card>
                <CardTitle className="mb-3">Location</CardTitle>
                <input type="text" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value, location: prev.location ?? FALLBACK_LOCATION }))} placeholder={isDetectingLocation ? 'Detecting...' : 'Enter address'}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--text-primary)] transition-colors" style={{ borderRadius: 'var(--radius-sm)' }} />
                {gpsError && !gpsLoading && (
                  <button
                    type="button"
                    onClick={requestLocation}
                    className="mt-3 text-xs uppercase tracking-[0.08em] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium"
                  >
                    Retry Location
                  </button>
                )}
              </Card>

              <Button className="w-full" size="lg" disabled={!form.title || !form.category || !form.severity || !form.location} onClick={() => setStep('review')}>Review Report</Button>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left: Photo (50%) */}
                <div className="animate-photo-fade">
                  {form.photos[0] ? (
                    <div className="relative aspect-[4/3] overflow-hidden border-2 border-[var(--black)] shadow-[6px_6px_0_0_var(--accent)]" style={{ borderRadius: 'var(--radius)' }}>
                      <img src={createPreviewUrl(form.photos[0])} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="relative aspect-[4/3] border-2 border-dashed border-[var(--border)] bg-[var(--bg-muted)] flex items-center justify-center" style={{ borderRadius: 'var(--radius)' }}>
                      <span className="text-sm text-[var(--text-muted)]">No photo</span>
                    </div>
                  )}
                </div>

                {/* Right: Content */}
                <div className="space-y-4 animate-slide-in-right">
                  <Card padding="lg">
                    <CardTitle className="mb-4">Review & Submit</CardTitle>
                    <div className="space-y-4">
                      <div><span className="label">Title</span><p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{form.title}</p></div>
                      {form.description && <div><span className="label">Description</span><p className="text-sm text-[var(--text-secondary)] mt-0.5">{form.description}</p></div>}
                      <div className="flex gap-4">
                        <div className="flex-1"><span className="label">Category</span><p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{form.category && ISSUE_CATEGORY_LABELS[form.category]}</p></div>
                        <div className="flex-1"><span className="label">Severity</span><p className="text-sm font-medium text-[var(--text-primary)] mt-0.5 capitalize">{form.severity}</p></div>
                      </div>
                      <div><span className="label">Location</span><p className="text-sm text-[var(--text-secondary)] mt-0.5">{form.address || 'Auto-detected'}</p></div>
                    </div>
                  </Card>
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => setStep('details')}>Edit</Button>
                    <Button className="flex-1" size="lg" isLoading={isSubmitting} disabled={!form.location} onClick={handleSubmit}>Submit Report</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};