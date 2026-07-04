
import {useQuery} from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'


//fetch user data:
const fetchUser = async () => {
    const response = await axiosInstance.get('/api/me')
    // console.log(`response : ${response}`)
    return response.data.user;
};

const useUser = () => {
    const {data : user, isLoading, isError, refetch} = useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry : 1
    });

    return {user, isLoading, isError, refetch};
};

export default useUser;