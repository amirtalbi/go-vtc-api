# API VTC - Fonctionnalités Avancées

Cette API VTC a été enrichie avec 4 fonctionnalités majeures pour supporter une application complète de type Uber :

## 🏢 1. Service de Commission

### Fonctionnalités
- **Calcul automatique des commissions** (pourcentage ou montant fixe)
- **Suivi des gains conducteurs** après déduction des commissions
- **Gestion des statuts** (en attente, calculé, payé, annulé)
- **Statistiques détaillées** par conducteur et entreprise
- **Historique complet** des commissions

### API Endpoints
```
POST   /commissions                    # Créer une commission
GET    /commissions                    # Lister toutes les commissions
GET    /commissions/stats              # Statistiques des commissions
GET    /commissions/driver/:driverId   # Commissions d'un conducteur
GET    /commissions/business/:businessId # Commissions d'une entreprise
PATCH  /commissions/:id/mark-paid     # Marquer comme payée
```

### Schéma Commission
- Lien avec la course et le conducteur
- Types de commission (pourcentage/fixe)
- Calcul automatique des gains
- Suivi des paiements

## 📍 2. Service de Localisation en Temps Réel

### Fonctionnalités
- **WebSocket en temps réel** pour le suivi des positions
- **Recherche de proximité** (conducteurs les plus proches)
- **Gestion des statuts** (en ligne, hors ligne, en course, pause)
- **Suivi des courses** en direct
- **Géolocalisation avancée** avec précision et vitesse

### API Endpoints
```
POST   /location/drivers/:driverId     # Mettre à jour la position
GET    /location/drivers/:driverId     # Récupérer la position
POST   /location/nearby               # Trouver conducteurs proches
PATCH  /location/drivers/:driverId/status # Changer le statut
GET    /location/drivers/online       # Conducteurs en ligne
```

### WebSocket Events
```javascript
// Connexion conducteur
socket.emit('driver:connect', { driverId: 'xxx' })

// Mise à jour position
socket.emit('location:update', {
  latitude: 48.8566,
  longitude: 2.3522,
  heading: 90,
  speed: 30,
  status: 'online'
})

// Suivi d'un conducteur
socket.emit('location:track', { targetDriverId: 'xxx' })
```

## 🔔 3. Système de Notifications

### Fonctionnalités
- **Notifications en temps réel** via WebSocket
- **Types variés** (course, paiement, système, commission)
- **Priorités configurables** (faible, moyenne, haute, urgente)
- **Gestion des statuts** (en attente, envoyé, lu)
- **Nettoyage automatique** des anciennes notifications

### API Endpoints
```
POST   /notifications                  # Créer une notification
GET    /notifications/user/:userId     # Notifications d'un utilisateur
GET    /notifications/user/:userId/unread-count # Nombre non lues
PATCH  /notifications/:id/mark-read    # Marquer comme lue
POST   /notifications/bulk             # Notification en masse
```

### WebSocket Events
```javascript
// Connexion utilisateur
socket.emit('user:connect', { userId: 'xxx' })

// Marquer comme lue
socket.emit('notification:mark:read', { notificationId: 'xxx' })

// Événements reçus
socket.on('notification:new', (notification) => {})
socket.on('notifications:unread:count', ({ count }) => {})
socket.on('ride:request', (rideData) => {})
```

## 💳 4. Système de Paiement Avancé

### Fonctionnalités
- **Méthodes multiples** (cartes, PayPal, Apple Pay, Google Pay, portefeuille)
- **Gestion des cartes** avec sécurité renforcée
- **Portefeuille numérique** avec historique complet
- **Intégration Stripe** complète
- **Remboursements** et transferts
- **Limites configurables** (quotidiennes, mensuelles)

### API Endpoints

#### Paiements
```
POST   /payments                       # Traiter un paiement
GET    /payments/user/:userId          # Paiements d'un utilisateur
POST   /payments/refund               # Rembourser un paiement
GET    /payments/stats                # Statistiques de paiements
```

#### Cartes de Paiement
```
POST   /payment-cards                 # Ajouter une carte
GET    /payment-cards/user/:userId    # Cartes d'un utilisateur
PATCH  /payment-cards/:id/set-default # Définir comme défaut
DELETE /payment-cards/:id             # Supprimer une carte
```

#### Portefeuille
```
GET    /wallets/user/:userId          # Portefeuille utilisateur
POST   /wallets/user/:userId/add-funds # Ajouter des fonds
POST   /wallets/user/:userId/withdraw  # Retirer des fonds
POST   /wallets/transfer              # Transférer entre utilisateurs
GET    /wallets/user/:userId/transactions # Historique
```

## 🏗️ Architecture Technique

### Technologies Utilisées
- **NestJS** - Framework Node.js
- **MongoDB** avec Mongoose
- **Socket.IO** - WebSocket en temps réel
- **Stripe** - Processeur de paiements
- **JWT** - Authentification
- **Swagger** - Documentation API

### Schémas de Base de Données

#### Commission
```typescript
{
  rideId: ObjectId,
  driverId: ObjectId,
  businessId?: ObjectId,
  rideAmount: number,
  commissionType: 'percentage' | 'fixed',
  commissionRate: number,
  commissionAmount: number,
  driverEarnings: number,
  status: 'pending' | 'calculated' | 'paid' | 'cancelled'
}
```

#### Location
```typescript
{
  driverId: ObjectId,
  latitude: number,
  longitude: number,
  heading: number,
  speed: number,
  accuracy: number,
  status: 'online' | 'offline' | 'on_ride' | 'break',
  currentRideId?: ObjectId,
  lastUpdate: Date
}
```

#### Notification
```typescript
{
  userId: ObjectId,
  type: 'ride_request' | 'payment_processed' | ...,
  title: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  status: 'pending' | 'sent' | 'delivered' | 'read',
  relatedRideId?: ObjectId,
  relatedPaymentId?: ObjectId
}
```

#### Payment
```typescript
{
  amount: number,
  currency: 'EUR' | 'USD' | ...,
  paymentMethod: 'credit_card' | 'paypal' | ...,
  status: 'pending' | 'completed' | 'failed' | ...,
  customerId: ObjectId,
  driverId?: ObjectId,
  rideId?: ObjectId,
  stripePaymentIntentId?: string,
  tipAmount: number,
  serviceFee: number
}
```

## 🚀 Démarrage Rapide

### Installation
```bash
npm install
```

### Variables d'Environnement
```env
MONGODB_URI=mongodb://localhost:27017/vtc-api
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Démarrage
```bash
npm run start:dev
```

### Documentation API
```
http://localhost:3000/api
```

## 🔐 Sécurité

- **Authentification JWT** sur tous les endpoints
- **Validation des données** avec class-validator
- **Chiffrement des mots de passe** avec bcrypt
- **Tokens Stripe** sécurisés
- **Validation des webhooks** Stripe

## 📊 Monitoring et Analytics

- **Logs détaillés** avec Winston
- **Métriques de performance** intégrées
- **Suivi des erreurs** avec gestion centralisée
- **Statistiques en temps réel** pour toutes les entités

## 🔄 Intégrations

### Stripe
- Paiements sécurisés
- Gestion des cartes
- Webhooks pour synchronisation
- Support multi-devises

### Socket.IO
- Localisation temps réel
- Notifications instantanées
- Suivi des courses
- Communication bidirectionnelle

## 📱 Compatibilité

Cette API est conçue pour supporter :
- **Applications mobiles** (iOS/Android)
- **Applications web** (React, Vue, Angular)
- **Intégrations tierces** via REST API
- **Webhooks** pour synchronisation externe

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:e2e

# Couverture de code
npm run test:cov
```

## 📈 Évolutions Futures

- Intelligence artificielle pour optimisation des trajets
- Support de la blockchain pour paiements
- Analyse prédictive des demandes
- Intégration avec véhicules autonomes
- API GraphQL en complément REST
