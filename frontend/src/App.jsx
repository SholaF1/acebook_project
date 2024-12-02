import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./App.css";
import { HomePage } from "./pages/Home/HomePage";
import { LoginPage } from "./pages/Login/LoginPage";
import { SignupPage } from "./pages/Signup/SignupPage";
import { FeedPage } from "./pages/Feed/FeedPage";
import { DiplomacyPage } from "./pages/Diplomacy/DiplomacyPage" 
import MyProfile from './pages/MyProfile/MyProfile'
import FindAlliance from "./pages/FindAlliances/FindAlliances";
import Diplomacy from "./pages/Diplomacy/Diplomacy"

// docs: https://reactrouter.com/en/main/start/overview
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/feed",
    element: <FeedPage />,
  },
  {
    path: '/myprofile',
    element: <MyProfile />,
  },
  {
    path: '/findalliances',
    element: <FindAlliance />
  },
  {
    path: '/diplomacy',
    element: <DiplomacyPage />
  }
// =======
//     element: <Diplomacy />,
//   },
// >>>>>>> main
  
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
