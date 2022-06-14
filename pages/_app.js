//Installed modules
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';

//Ours
import { Navbar,Footer } from '../components';
import '../styles/globals.css';

const MyApp = ({ Component, pageProps }) => (
  <ThemeProvider attribute='class'>
    <div className='dark:bg-nft-dark bg-white min-h-screen'>
      <Navbar></Navbar>
      <Component {...pageProps}/>
      <Footer></Footer>
    </div>
    <Script src="https://kit.fontawesome.com/c1a1c44616.js" crossorigin="anonymous"></Script>
  </ThemeProvider>
)

export default MyApp
