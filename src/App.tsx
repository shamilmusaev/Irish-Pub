import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Admin from './components/Admin';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import ReactPlugin from '@stagewise-plugins/react';

// Lazy load components
const About = lazy(() => import('./components/About'));
const Menu = lazy(() => import('./components/Menu'));
const Entertainment = lazy(() => import('./components/Entertainment'));
const AllMatches = lazy(() => import('./components/AllMatches'));
const Contact = lazy(() => import('./components/Contact'));

gsap.registerPlugin(ScrollTrigger);

// Loading component
const Loading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px',
    color: '#c8b273'
  }}>
    Loading...
  </div>
);

function App() {
  useEffect(() => {
    // Обработка хэша в URL при загрузке страницы
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        // Извлекаем только ID элемента из хеша, игнорируя параметры URL
        const elementId = hash.split('?')[0];
        const element = document.querySelector(elementId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }, []);

  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
      )}
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="outer-container">
              <div className="inner-container">
                <div className="App">
                  <Navbar />
                  <section id="hero">
                    <Hero />
                  </section>
                  <Suspense fallback={<Loading />}>
                    <section id="about">
                      <About />
                    </section>
                    <section id="menu">
                      <Menu />
                    </section>
                    <section id="entertainment">
                      <Entertainment />
                    </section>
                    <section id="contact">
                      <Contact />
                    </section>
                  </Suspense>
                </div>
              </div>
            </div>
          } />
          <Route path="/all-matches" element={
            <>
              <Navbar />
              <Suspense fallback={<Loading />}>
                <AllMatches />
              </Suspense>
            </>
          } />
          <Route path="/admin" element={
            <Suspense fallback={<Loading />}>
              <Admin />
            </Suspense>
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App;
