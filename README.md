# Bean Jar - Social Achievement Tracking

Bean Jar is a social app where you add a bean to your jar every time you accomplish any small thing in your day, and all your friends can see your most recent bean.

## 🌱 Concept

- **Add beans** for daily accomplishments (big or small!)
- **Share your progress** with friends
- **See what your friends** are accomplishing
- **Build momentum** through visual progress tracking
- **Stay motivated** by celebrating small wins

## Requirements

- **Node.js** (LTS recommended, e.g. 20.x)
- **npm** (comes with Node)
- **Git**
- Expo tooling will be installed as part of `npm install`.

## Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/malachyfernandez/BeanJar.git
   cd BeanJar
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the app**

   Available scripts (from `package.json`):

   - Start Metro / Expo dev server:

     ```bash
     npm run start
     ```

   - Run on Android (device or emulator):

     ```bash
     npm run android
     ```

   - Run on iOS (simulator):

     ```bash
     npm run ios
     ```

   - Run on the web (Expo web):

     ```bash
     npm run web
     ```

   Follow the Expo CLI instructions in your terminal to open on your target platform.

## Tech Stack

- **Expo** - React Native development platform
- **Convex** - Backend database and real-time sync
- **Clerk** - Authentication and user management
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling with NativeWind
- **Custom hooks** - Seamless Convex and Clerk integration

## Features

- ✅ User authentication with Clerk
- ✅ Real-time data sync with Convex
- ✅ Bean tracking and counting
- ✅ Social feed to see friends' beans
- ✅ Responsive design for mobile and web

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using React Native, Expo, Convex, and Clerk.


