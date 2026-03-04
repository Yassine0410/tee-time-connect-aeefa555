import 'package:cloud_firestore/cloud_firestore.dart';

class UserProfileService {
  UserProfileService(this._firestore);

  final FirebaseFirestore _firestore;

  Future<void> createProfileIfNotExists({
    required String uid,
    required String email,
  }) async {
    final docRef = _firestore.collection('users').doc(uid);
    final doc = await docRef.get();

    if (doc.exists) return;

    await docRef.set({
      'email': email,
      'displayName': '',
      'handicap': 36,
      'homeClub': '',
      'avatarUrl': '',
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }
}
