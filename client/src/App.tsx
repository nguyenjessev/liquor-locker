import { Layout } from "./components/Layout";
import { AIProvider } from "./context/AIContext";
import "./App.css";

function App() {
	return (
		<AIProvider>
			<Layout />
		</AIProvider>
	);
}

export default App;
