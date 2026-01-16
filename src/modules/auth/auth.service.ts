import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

/**
 * Service d'authentification
 *
 * CONCEPT NestJS - SERVICE:
 * Un service contient la logique métier de l'application.
 * Il est injecté dans les contrôleurs via le constructeur (Dependency Injection).
 *
 * @Injectable() rend la classe injectable dans d'autres classes.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService, // Service NestJS pour créer/vérifier des tokens JWT
  ) {}

  /**
   * Authentifie un utilisateur et retourne un token JWT
   */
  async login(loginDto: LoginDto) {
    // 1. Chercher l'utilisateur par email
    // { select: ['password'] } force TypeORM à inclure le password (normalement exclu)
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'password', 'firstName', 'lastName'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Vérifier le mot de passe hashé avec bcrypt
    // bcrypt.compare() compare le mot de passe en clair avec le hash
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Créer le payload du JWT (données qu'on met dans le token)
    const payload = {
      sub: user.id, // "sub" = subject, convention JWT pour l'ID utilisateur
      email: user.email,
    };

    // 4. Générer le token JWT signé
    const accessToken = this.jwtService.sign(payload);

    // 5. Retourner le token et les infos utilisateur
    return {
      accessToken,
      refreshToken: accessToken, // En prod, créer un vrai refresh token différent
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN) || 3600,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  /**
   * Utilitaire pour hasher un mot de passe
   * Utilisé lors de la création d'un utilisateur
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10); // Génère un "sel" pour le hash
    return bcrypt.hash(password, salt); // Hash le mot de passe avec le sel
  }
}
