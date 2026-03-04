import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/auth/data/firebase_auth_service.dart';
import 'package:mobile/features/rounds/data/rounds_service.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = FirebaseAuthService(FirebaseAuth.instance);
    final roundsService = RoundsService(FirebaseFirestore.instance);
    final currentUser = FirebaseAuth.instance.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Accueil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await authService.signOut();
              if (context.mounted) context.go('/auth');
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/rounds/create'),
        icon: const Icon(Icons.add),
        label: const Text('Creer une partie'),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              'Connecte en tant que: ${currentUser?.email ?? 'inconnu'}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
          Expanded(
            child: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: roundsService.streamRounds(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return const Center(child: Text('Impossible de charger les parties.'));
                }

                final docs = snapshot.data?.docs ?? [];
                final openRounds = docs.where((doc) => (doc.data()['status'] ?? 'open') == 'open').toList();

                if (openRounds.isEmpty) {
                  return const Center(child: Text('Aucune partie ouverte pour le moment.'));
                }

                return ListView.separated(
                  itemCount: openRounds.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final data = openRounds[index].data();
                    final dateTime = (data['dateTime'] as Timestamp?)?.toDate();
                    final formattedDate = dateTime == null
                        ? 'Date inconnue'
                        : DateFormat('dd/MM/yyyy HH:mm').format(dateTime);

                    return ListTile(
                      title: Text(data['courseName'] ?? 'Parcours inconnu'),
                      subtitle: Text('${data['clubName'] ?? ''} - ${data['city'] ?? ''}\n$formattedDate'),
                      isThreeLine: true,
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('${data['holes'] ?? 18} trous'),
                          Text('${data['gameType'] ?? 'N/A'}'),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}