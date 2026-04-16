import { Redirect } from 'wouter';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Redirect to="/login" />;
    }

    return <>{children}</>;
};
