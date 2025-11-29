import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FileUpload from './pages/FileUpload';
import './App.css';
import HealthCheckPage from './pages/HealthCheck';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<FileUpload />} />
				<Route path="/health_check" element={<HealthCheckPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;