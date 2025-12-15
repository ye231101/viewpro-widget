import { Toaster } from 'react-hot-toast';
import VideoCall from './components/VideoCall';
import './App.css';

function App() {
  return (
    <main>
      <VideoCall />
      <Toaster />
    </main>
  );
}

export default App;
