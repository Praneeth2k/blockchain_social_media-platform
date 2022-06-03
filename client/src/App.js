import logo from './logo.svg';
import './App.css';
import Navbar from './Navbar';
import MainComponent from './MainComponent';
import {useState} from "react";
import Footer from './Footer';

function App() {
  let initialTheme
  if(localStorage.theme){
    initialTheme = localStorage.theme
  }
  else initialTheme = "light"

  const [theme, setTheme] = useState(initialTheme)

  const toggleTheme = () => {
    if(theme === "light"){
      localStorage.theme = "dark"
      setTheme("dark")
    } else {
      localStorage.theme = "light"
      setTheme("light")
    }
  }
  return (
    <div class={`${theme} min-h-screen`}>
      <Navbar theme={theme} toggleTheme={toggleTheme}/>
      <MainComponent />
      <Footer class="aside"></Footer>
    </div>
  );
}

export default App;