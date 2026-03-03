import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/presentation/auth_page.dart';
import 'package:mobile/features/rounds/presentation/home_page.dart';


final GoRouter appRouter = GoRouter(
  initialLocation: '/auth',
  routes: [
    GoRoute(
      path: '/auth',
      builder: (context, state) => const AuthPage(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomePage(),
    ),
  ],
);