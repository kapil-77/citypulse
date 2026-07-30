import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { IssueDetailPage } from '../pages/IssueDetailPage';
import { ReportPage } from '../pages/ReportPage';
import { LocalityPage } from '../pages/LocalityPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/issue/:id',
    element: <IssueDetailPage />,
  },
  {
    path: '/report',
    element: <ReportPage />,
  },
  {
    path: '/localities',
    element: <LocalityPage />,
  },
  {
    path: '*',
    element: <HomePage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};