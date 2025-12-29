import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});


// check expiry of token
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        // get payload (Header.Payload.Signature)
        const base64Url = token.split('.')[1];
        // decode: convert Base64URL to standard Base64, then decode
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Check if token has expired (exp is in seconds, Date.now() is in milliseconds)
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return true; // Token is expired
        }
        return false; // Token is still valid
    } catch (error) {
        // If we can't decode the token, consider it expired/invalid
        return true;
    }
}


// request interceptor to attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// response interceptor for 401 unauthorized response
// brings user back to login screen

api.interceptors.response.use(
    (response) => {
        console.log('Not redirected to login');
        return response;
    },
        
    (error) => {
        const originalRequestUrl = error.config?.url;
        if (error.response && error.response.status === 401) {
            if (originalRequestUrl.includes('/login') || originalRequestUrl.includes('/auth')){  // don't redirect for failed logins
                console.log("Login failed - staying on page to show error message.");
            } else {
            // token expired or otherwise invalic
                localStorage.removeItem('token');
                console.log('Redirected to login');
                window.location.href = '/login';
                }

        }
        return Promise.reject(error);
    }
)

export default api;