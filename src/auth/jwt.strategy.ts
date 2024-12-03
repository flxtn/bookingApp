import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './interfaces/jwt.payload.interface';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        const publicKey = configService
          .get<string>('JWT_PUBLIC_KEY')
          .replace(/\\n/g, '\n');

        if (!publicKey) {
          return done(new Error('Public key is not defined'), null);
        }
        return done(null, publicKey);
      },
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException('User not found or unauthorized');
    }
    return user;
  }
}
