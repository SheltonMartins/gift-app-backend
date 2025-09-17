declare module 'passport-google-token' {
  import { Strategy as PassportStrategy } from 'passport';

  interface GoogleTokenStrategyOptions {
    clientID: string;
    clientSecret?: string;
  }

  type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: GoogleTokenStrategyOptions, verify: VerifyFunction);
  }
}
