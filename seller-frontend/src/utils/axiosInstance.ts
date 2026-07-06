import axios from "axios"

const axiosInstance = axios.create({
    baseURL : process.env.NEXT_PUBLIC_API_URL,
    withCredentials : true
});

let isRefreshing = false;
let refreshSubscribers : (()=>void)[] = [];

//Handle logout and prevent infinite loops:
const handleLogout = () => {
    if(window.location.pathname !== '/login'){
        window.location.href = '/login';
    }
};

//Handle adding new access token to new request:
const subscribeTokenRefresh = (callback : ()=>void)=>{
    refreshSubscribers.push(callback);
};

//Execute queued requests after refresh
const onRefreshSuccess = ()=>{
    refreshSubscribers.forEach((callback)=>callback());
    refreshSubscribers = [];
};

//Handle API Req:
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)

//Handle expired Token and refresh logic:
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // if (originalRequest?.url?.includes('/api/me')) {
        //     return Promise.reject(error);
        // }

        //prevent infinite loops
        if(error.response?.status === 401 && !originalRequest._retry){
            if(isRefreshing){
                return new Promise((resolve) => {
                    subscribeTokenRefresh(()=>resolve(axiosInstance(originalRequest)));
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/refresh-token`,
                    {},
                    { withCredentials : true }
                );
                isRefreshing = false;
                onRefreshSuccess();
                return axiosInstance(originalRequest);
            } catch (error) {
                isRefreshing = false;
                refreshSubscribers = [];
                handleLogout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;