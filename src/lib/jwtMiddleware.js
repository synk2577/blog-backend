import jwt, { decode } from 'jsonwebtoken';
import User from '../models/user';

const jwtMiddleware = async (ctx, next) => {
  const token = ctx.cookies.get('access_token');
  if (!token) return next(); // 토큰 없음

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ctx의 state에 토큰이 해석된 결과를 미들웨어 사용 가능하도록 함
    ctx.state.user = {
      _id: decode._id,
      username: decoded.username,
    };

    console.log(decoded);

    // 토큰의 남은 유효 기간이 3.5일 미만이면 재발급
    const now = Math.floor(Date.now() / 1000);
    if (decode.exp - now < 60 * 60 * 24 * 3.5) {
      const user = await User.findById(decode._id);
      const token = user.generateToken();
      ctx.cookies.set('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, //7dlf
        httpOnly: true,
      });
    }

    return next();
  } catch (e) {
    // 토큰 검증 실패
    return next();
  }
};

export default jwtMiddleware;
