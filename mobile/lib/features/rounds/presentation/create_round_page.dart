import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/rounds/data/rounds_service.dart';

class CreateRoundPage extends StatefulWidget {
  const CreateRoundPage({super.key});

  @override
  State<CreateRoundPage> createState() => _CreateRoundPageState();
}

class _CreateRoundPageState extends State<CreateRoundPage> {
  final _formKey = GlobalKey<FormState>();
  final _courseCtrl = TextEditingController();
  final _clubCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _descriptionCtrl = TextEditingController();
  final _minHandicapCtrl = TextEditingController(text: '0');
  final _maxHandicapCtrl = TextEditingController(text: '54');
  final _maxPlayersCtrl = TextEditingController(text: '4');

  final _service = RoundsService(FirebaseFirestore.instance);

  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 9, minute: 0);
  String _gameType = 'stroke_play';
  int _holes = 18;
  bool _isSaving = false;
  String? _error;

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (picked != null) setState(() => _selectedTime = picked);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _error = 'Session invalide. Reconnecte-toi.');
      return;
    }

    setState(() {
      _isSaving = true;
      _error = null;
    });

    try {
      final dateTime = DateTime(
        _selectedDate.year,
        _selectedDate.month,
        _selectedDate.day,
        _selectedTime.hour,
        _selectedTime.minute,
      );

      await _service.createRound(
        organizerUid: user.uid,
        courseName: _courseCtrl.text.trim(),
        clubName: _clubCtrl.text.trim(),
        city: _cityCtrl.text.trim(),
        dateTime: dateTime,
        gameType: _gameType,
        holes: _holes,
        minHandicap: int.parse(_minHandicapCtrl.text.trim()),
        maxHandicap: int.parse(_maxHandicapCtrl.text.trim()),
        maxPlayers: int.parse(_maxPlayersCtrl.text.trim()),
        description: _descriptionCtrl.text.trim(),
      );

      if (!mounted) return;
      context.pop();
    } catch (_) {
      setState(() => _error = 'Impossible de creer la partie pour le moment.');
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  void dispose() {
    _courseCtrl.dispose();
    _clubCtrl.dispose();
    _cityCtrl.dispose();
    _descriptionCtrl.dispose();
    _minHandicapCtrl.dispose();
    _maxHandicapCtrl.dispose();
    _maxPlayersCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Creer une partie')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _courseCtrl,
              decoration: const InputDecoration(labelText: 'Parcours'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Parcours requis' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _clubCtrl,
              decoration: const InputDecoration(labelText: 'Club'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Club requis' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _cityCtrl,
              decoration: const InputDecoration(labelText: 'Ville'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Ville requise' : null,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _gameType,
              items: const [
                DropdownMenuItem(value: 'stroke_play', child: Text('Stroke Play')),
                DropdownMenuItem(value: 'match_play', child: Text('Match Play')),
                DropdownMenuItem(value: 'scramble', child: Text('Scramble')),
              ],
              onChanged: (value) => setState(() => _gameType = value ?? 'stroke_play'),
              decoration: const InputDecoration(labelText: 'Type de partie'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<int>(
              value: _holes,
              items: const [
                DropdownMenuItem(value: 9, child: Text('9 trous')),
                DropdownMenuItem(value: 18, child: Text('18 trous')),
              ],
              onChanged: (value) => setState(() => _holes = value ?? 18),
              decoration: const InputDecoration(labelText: 'Nombre de trous'),
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Date'),
              subtitle: Text('${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}'),
              trailing: TextButton(onPressed: _pickDate, child: const Text('Changer')),
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Heure'),
              subtitle: Text(_selectedTime.format(context)),
              trailing: TextButton(onPressed: _pickTime, child: const Text('Changer')),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _minHandicapCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Handicap min'),
                    validator: (v) => (v == null || int.tryParse(v) == null) ? 'Nombre requis' : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _maxHandicapCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Handicap max'),
                    validator: (v) => (v == null || int.tryParse(v) == null) ? 'Nombre requis' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _maxPlayersCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Nombre max de joueurs'),
              validator: (v) => (v == null || int.tryParse(v) == null) ? 'Nombre requis' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _descriptionCtrl,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Description (optionnel)'),
            ),
            const SizedBox(height: 16),
            if (_error != null) Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _isSaving ? null : _submit,
              child: Text(_isSaving ? 'Creation...' : 'Creer la partie'),
            ),
          ],
        ),
      ),
    );
  }
}