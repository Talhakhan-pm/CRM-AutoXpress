import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CallbacksPage from './pages/Callbacks';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<CallbacksPage />} />
        <Route path="callbacks" element={<CallbacksPage />} />
      </Route>
    </Routes>
  );
}

export default App;