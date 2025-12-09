import './App.css';
import VisaApplicationForm from './components/VisaApplicationForm';

function App() {
  return (
    <div className="App">
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">Welcome to Rwanda</h1>
          <p className="hero-subtitle">Land of a Thousand Hills | Visa On Arrival Portal</p>
        </div>
      </div>
      <VisaApplicationForm />
    </div>
  );
}

export default App;
