import { Fragment } from 'react/jsx-runtime';
import { Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import NewPost from './pages/NewPost';
import UpdatePost from './pages/UpdatePost';
import Home from './pages/Home';

function App() {
    return (
        <Fragment>
            <Switch>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />

                <Route path="/new">
                    <ProtectedRoute>
                        <NewPost />
                    </ProtectedRoute>
                </Route>

                <Route path="/update">
                    <ProtectedRoute>
                        <UpdatePost />
                    </ProtectedRoute>
                </Route>

                <Route path="/">
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                </Route>

                <Route>404: Page not found</Route>
            </Switch>
            <Toaster />
        </Fragment>
    );
}
export default App;
