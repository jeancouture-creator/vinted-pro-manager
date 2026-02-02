/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Accounts from './pages/Accounts';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Finances from './pages/Finances';
import Inventory from './pages/Inventory';
import Marketing from './pages/Marketing';
import Orders from './pages/Orders';
import Pricing from './pages/Pricing';
import Returns from './pages/Returns';
import Settings from './pages/Settings';
import SocialAutomation from './pages/SocialAutomation';
import AIOptimization from './pages/AIOptimization';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accounts": Accounts,
    "Admin": Admin,
    "Analytics": Analytics,
    "Billing": Billing,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "Finances": Finances,
    "Inventory": Inventory,
    "Marketing": Marketing,
    "Orders": Orders,
    "Pricing": Pricing,
    "Returns": Returns,
    "Settings": Settings,
    "SocialAutomation": SocialAutomation,
    "AIOptimization": AIOptimization,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};