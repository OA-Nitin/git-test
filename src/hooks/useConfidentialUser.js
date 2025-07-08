import { useState, useEffect } from 'react';
import axios from 'axios';
import { getUserId } from '../utils/userUtils';

export default function useConfidentialUser() {
  const [isConfidentialUser, setIsConfidentialUser] = useState(false);
  const [confidenceUser, setConfidenceUser] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    axios
      .get(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/confidential-user?user_id=' +
          getUserId()
      )
      .then((response) => {
        if (response.data.status === 1) {
          setIsConfidentialUser(true);
          setConfidenceUser(response.data.confidence_user);
        }
      })
      .catch(() => {
        if (isMounted) setIsConfidentialUser(false);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);
  return { confidenceUser };
} 