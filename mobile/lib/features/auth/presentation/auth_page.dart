import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/data/firebase_auth_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile/features/auth/data/user_profile_service.dart';


class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _service = FirebaseAuthService(FirebaseAuth.instance);
  final _profileService = UserProfileService(FirebaseFirestore.instance);

  bool _isLoading = false;
  String? _error;
  bool _isSignUp = false;

  Future<void> _submit() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final email = _emailCtrl.text.trim();
      final password = _passwordCtrl.text.trim();

      if (email.isEmpty || password.isEmpty) {
        throw FirebaseAuthException(
          code: 'invalid-input',
          message: 'Email et mot de passe obligatoires.',
        );
      }

      if (_isSignUp) {
  final credential = await FirebaseAuth.instance
      .createUserWithEmailAndPassword(email: email, password: password);

  await _profileService.createProfileIfNotExists(
    uid: credential.user!.uid,
    email: credential.user!.email ?? email,
  );
} else {
  await _service.signIn(email: email, password: password);
}

      if (!mounted) return;
      context.go('/home');
    } on FirebaseAuthException catch (e) {
      setState(() => _error = e.message ?? 'Erreur d’authentification.');
    } catch (_) {
      setState(() => _error = 'Erreur inattendue.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isSignUp ? 'Inscription' : 'Connexion')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Mot de passe'),
            ),
            const SizedBox(height: 16),
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: Text(_isLoading
                    ? 'Chargement...'
                    : (_isSignUp ? 'Créer un compte' : 'Se connecter')),
              ),
            ),
            TextButton(
              onPressed: _isLoading
                  ? null
                  : () => setState(() => _isSignUp = !_isSignUp),
              child: Text(_isSignUp
                  ? 'J’ai déjà un compte'
                  : 'Créer un nouveau compte'),
            ),
          ],
        ),
      ),
    );
  }
}
