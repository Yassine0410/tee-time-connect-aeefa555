import 'package:cloud_firestore/cloud_firestore.dart';

class RoundsService {
  RoundsService(this._firestore);

  final FirebaseFirestore _firestore;

  Stream<QuerySnapshot<Map<String, dynamic>>> streamRounds() {
    return _firestore
        .collection('golf_rounds')
        .orderBy('createdAt', descending: true)
        .limit(50)
        .snapshots();
  }

  Future<void> createRound({
    required String organizerUid,
    required String courseName,
    required String clubName,
    required String city,
    required DateTime dateTime,
    required String gameType,
    required int holes,
    required int minHandicap,
    required int maxHandicap,
    required int maxPlayers,
    String description = '',
  }) async {
    final now = FieldValue.serverTimestamp();

    await _firestore.collection('golf_rounds').add({
      'organizerUid': organizerUid,
      'courseName': courseName,
      'clubName': clubName,
      'city': city,
      'dateTime': Timestamp.fromDate(dateTime),
      'gameType': gameType,
      'holes': holes,
      'minHandicap': minHandicap,
      'maxHandicap': maxHandicap,
      'maxPlayers': maxPlayers,
      'currentPlayers': 1,
      'status': 'open',
      'description': description,
      'createdAt': now,
      'updatedAt': now,
    });
  }
}