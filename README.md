# pistejaska

With this web app you can easily track board game scores. The app provides support for adding different board game templates.

Using the app requires Google login with whitelisted email. Emails are whitelisted on https://console.firebase.google.com/project/pistejaska-dev/database/firestore/rules. Ask panu.vuorinen@gmail.com for permissions.

## Contributing

- Ensure all tests pass (`npm test`)
- Ensure code coverage is maintained (`npm run test:coverage`)
- Manually test that Pistejaska still works
- Update changelog
- Make PR to https://bitbucket.org/panula/pistejaska-react/

## Requirements

1. node.js (20 or newer)

## Technologies and why we use them

- `React` as a front-end library for productivity due to good composability and large ecosystem
- `Tailwind CSS` as a CSS utility library for productivity and easy visuals as the app is designed by developers, not designers
- `Typescript` as a language for productivity due to great tooling (like auto-complete due to static types)
- `lodash` as a base library, as JavaScript's base library is lacking and of poor quality
- `Firebase authentication & Firestore` as a backend for productivity, real-time database and (practically) free hosting. Admin is panu.vuorinen@gmail.com.
- `Netlify` as a hosting platform due to free price and easy-to-setup continuous delivery

## Developing

Please use eslint and prettier for code formatting & linting.

Easiest way to achieve this is to

- Use VS Code
- Install [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension
- Install [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension
- Configure `"editor.formatOnSave": true` setting.
- Set "Prettier" as the default formatter

Alternatively, you can run `npx prettier src/* --write` to format all files in project root before committing.

### Tips

- Analyze bundle size: `npm run build && npm run analyze`
- Install [Tailwind CSS Intellisense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension

## Developing

1. `npm install`
1. `npm start`

## Testing

Run all tests:
`npm test`

Run tests in watch mode:
`npx vitest`

Generate code coverage report:
`npm run test:coverage`

## Building

1. `npm run build`

## Hosting

Master branch of this project is automatically built & hosted in Netlify (https://www.pistejaska.net, also responds from https://pistejaska.panu.dev)

## Backups

### Setup

1. Install gcloud (https://cloud.google.com/sdk/docs/install)
1. `gcloud auth login`
1. `gcloud config set project pistejaska-dev`

### Backup export

1. `gsutil -m cp -R gs://pistejaska-dev.appspot.com . # copy photos`
1. `gcloud firestore export gs://pistejaska-dev-firestore-backups # export firestore`
1. `gsutil -m cp -R gs://pistejaska-dev-firestore-backups . # copy firestore backup`
1. Copy Firestore rules manually from https://console.firebase.google.com/u/0/project/pistejaska-dev/firestore/rules

### Backup import

1. Get backup name from https://console.cloud.google.com/storage/browser/pistejaska-dev-firestore-backups?project=pistejaska-dev
1. `gcloud beta firestore import --database="backup" gs://pistejaska-dev-firestore-backups/{name}`

## Migrations

If you need to perform data migrations, do this:

1. Take a backup of the current database :)
1. Acquire Google Cloud Service Account credentials JSON from one of the project admins.
1. Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to point to the credentials JSON
   (see https://cloud.google.com/firestore/docs/quickstart-servers#set_up_authentication for details).
1. Write a migration script under migrations/, prefix the script name with the next free version number.
   See existing scripts for examples.
1. Test migration: `node V0x_MyGreatMigration.js`
1. Run migration: `node V0x_MyGreatMigration.js --prod`

## TODO

- Allow users to change their display name in comments and in plays
- Denormalize players from plays to their own root entity & link player to user
- change "misc score field" for unknown expansion scores to be the last field of the PlayForm
- statistical analysis for strongest victory predictor (eg. start order (is starting player more likely to win), number of dwarfs in caverna, player, race used)
- generic reports: games by plays, longest/shortest games, best ELO rating for all games etc
- read support for everyone, write support for whitelisted emails. anonymous users only see anonymized player names.
- normalize player names (firstname and first letter of surname)
- celebration page on save to see the winner with konfetti animation

### Technical debt

- normalize players to their own root entity in Firestore
- better backups
- automatic tests, e.g. playwright

## Known issues

- PWA does not work
