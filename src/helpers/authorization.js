import { useSelector } from 'react-redux';
const useAuthorization = () => {
    const currentLoggedUser = useSelector(state => state.auth.userdata);
    return currentLoggedUser;
};
  
export default useAuthorization;