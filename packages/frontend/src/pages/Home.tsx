import { Header } from '@/components/Header';
import { PostList } from '@/components/PostList';

function Home() {
    return (
        <div>
            <Header />
            <div className="flex justify-center p-6">
                <div className="max-w-[700px] w-full">
                    <PostList />
                </div>
            </div>
        </div>
    );
}

export default Home;
