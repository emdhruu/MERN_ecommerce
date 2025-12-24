import Header from '../features/header/Header';
import { Outlet } from 'react-router-dom';
import Footer from '../features/footer/Footer';

const UserLayout = () => {
  return (
    <>
        <Header/>
        <Outlet/>
        <Footer/>
    </>
  )
}

export default UserLayout