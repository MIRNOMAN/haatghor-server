import axios from 'axios';
import config from '../../config';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

interface IGoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export const getGoogleUser = async (code: string): Promise<IGoogleUser> => {
  try {
    // Exchange code for tokens
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: config.google?.client_id,
      client_secret: config.google?.client_secret,
      redirect_uri: config.google?.callback_url,
      grant_type: 'authorization_code',
    });

    const { access_token, id_token } = data;

    // Get user info
    const { data: userInfo } = await axios.get<IGoogleUser>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    return userInfo;
  } catch (error: any) {
    console.error('Google OAuth error:', error.response?.data || error.message);
    throw new AppError(httpStatus.UNAUTHORIZED, 'Failed to authenticate with Google');
  }
};

export const generateGoogleAuthUrl = (): string => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: config.google?.callback_url as string,
    client_id: config.google?.client_id as string,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
};
