import Header from '../features/header/Header';
import { Outlet } from 'react-router-dom';
import Footer from '../features/footer/Footer';

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
        <Header/>
        <main className="flex-1">
          <Outlet/>
        </main>
        <Footer/>
    </div>
  )
}

export default UserLayout