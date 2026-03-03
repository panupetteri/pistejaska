# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 2026-03-03

### Added

- Search functionality to play list (front page) & to games

## 2026-03-02

### Added

- Expansions support to visual game editor (in admin panel)

## 2026-03-01

### Fixed

- Admin beta edit mode deleted game expansions on save
- Nicer error handling on error situations

## 2024-10-18

### Changed

- Allow infinite loop scrolling for full screen image: when navigating left from first image the oldest image is shown

### Fixed

- Performance issue with play list full screen image

## 2024-10-17

### Fixed

- Performance issue with play list full screen image (it used to load all images (>1GB) on open)

## 2023-09-04

### Added

- The admin side now allows editing existing games using the same form that is used to add new games
- Games can now be deleted from the admin frontpage

### Changed

- Various improvements to the form used to add/edit games in the admin side:
  - The form sections now stack horizontally for more efficient use of screen real estate on desktop
  - Added simple form validations
  - Options defined for a game field can now be deleted, and the list of options is sortable
  - Game and field ids are no longer visible/editable, but are generated automatically during save

### Fixed

- Do not count ongoing plays to game reports

## 2023-08-29

### Added

- The admin side now has a form that can be used to add a new game
  - Currently missing features of the new form:
    - Not possible to add expansions
    - Not possible to edit existing games
    - Not possible to define options to score fields (although this is rarely needed)
  - The JSON editor is still available, and has to be used for editing and deleting games

### Changed

- The admin side now has a frontpage that contains links to the new game creation form and the JSON editor

## 2023-04-30

### Fixed

- Fix crash on Firefox when parsing malformed play dates

## 2023-02-26

### Changed

- Better UX when inputting dates (native datepicker)
- Better UX: navigates back to reports from back button if navigated to play from reports view

## 2023-02-03

### Added

- Reports for a player in some specific game

## 2023-01-30

- **Images can be added to a play also when viewing a play** (above the comments)
- When editing a play, **you can jump to a certain category easily** by clicking the category heading, and then choosing another category from the dropdown menu
- **The name of the play can be edited from any category** by clicking the game name heading and typing a name there. The name can also be edited in "Metadata" normally

## 2022-11-06

### Fixed

- Cannot login with Safari

## 2022-10-09

### Changed

- UX improvement: disabled autocomplete on all input fields

## 2022-08-07

### Added

- UX improvement: clicking play view's game icon navigates to game report viewlogo

## 2022-06-08

### Added

- Count of comments to play list to make it easier to recognize plays with comments

### Changed

- Renamed "Random starting player" to "Randomize starter" to fit the buttons in one row

## 2022-05-26

### Changed

- Moved “Shuffle seat order” to a new “dropdown” that can be opened next to the “Random starting player” button
- The player list sorts first players who have played most together with the ones already selected to the play. This speeds up starting a new play with a familiar group of players.

## 2022-04-07

### Changed

- Allow plays with 1 player

## 2022-03-17

### Fixed

- Player view games list
- Minor UI layout issues on mobile

### Changed

- Overflowing tables are now side-scrollable

## 2022-03-12

### Added

- Recently played ordering for game list

### Changed

- The default ordering of game list from "By name" to "Recently played"

## 2022-03-06

### Changed

- Added some darkness to photo gallery overlay background, so that the backdrop looks good on browsers that do not support blur effect (e.g. Firefox Mobile)

## 2022-03-03

### Added

- Confirm deleting a comment
- Comments containing only emojis have larger font size

### Fixed

- Long-press on a comment does not occur while scrolling
- Tooltip is not shown on a comment that has been long-pressed

### Changed

- A comment can be long-pressed only by touching, not with a mouse. You may use desktop browser developer tools to simulate touches.
- When a comment is long-pressed, the dropdown opens directly below the comment itself, instead of the icon
- Changed the timestamp positioning in the comments to the bottom right

## 2022-03-01

![Improved commenting UI](https://bitbucket.org/repo/eyyL58g/images/1832721718-Screenshot%202022-03-01%20at%2015.11.50.png)

### Added

- Redesigned the comment lists
- Ability to remove own comments
- Comments support Markdown syntax and any URLs are automatically made links
- Pressing enter sends the typed comment

### Changed

- Change comment ordering to oldest first

### Fixed

- Fixed comment list layout on long message words, e.g. URLs
- Show play dimension values from option fields as option labels instead of values (option IDs)

## 2022-02-27

### Changed

- Replace Date API with Temporal API (https://tc39.es/proposal-temporal/)

## 2022-02-25

### Added

- Commenting support for plays

### Fixed

- Fixed "What's new" view to show the contents of the CHANGELOG.md file correctly

### Changed

- Allow users to only delete plays they have created. Admins can still delete any play.

## 2022-02-24

### Changed

- Moved tie breaker and misc score fields to be the last ones on play edit

### Fixed

- Fixed broken native select field look on Safari

## 2022-02-22

### Fixed

- Play view layout issue on desktop

## 2022-02-17

### Added

- Play list view shows a gallery of the images from the plays
- Clicking any image opens a swipeable gallery overlay with a nice transition animations

## 2022-02-14

### Fixes

- Fixed the input focus effect on Safari

### Refactoring

- Upgraded `react-router-dom` to version 6. This was a major update, so needed to change the code accordingly.
- Navigation happens primarily via actual link elements, instead of "if clicked then navigate browser" logic

## 2022-02-13

### Refactoring

- MaterialUI is no longer used!
  - Nav bar is a custom non-MUI implementation
  - Do not use MUI circle spinner any more
  - Play list has simple "Show more" instead of MUI pagination
  - Player list uses custom non-MUI list components
  - All tables are custom non-MUI table components
  - All MUI styling is replaced by TailwindCSS
  - Removed `@material-ui` from dependencies

### Fixed

- Link to front page from app name in navbar

### Changed

- New design to play view. Separate designs for mobile & desktop.
- Gray color to slate color in all views

## 2022-02-09

### Refactoring

- More custom implementation of form components instead of MUI:
  - Multi-select field (used in reporting filters)
  - Non-native single-select field (used in reporting filters)
  - Re-usable dropdown menu component, used by select fields & the nav bar

## 2022-01-31

### Added

- Improvements when listing plays:
  - Show "(Ongoing)" for plays that seem not to be resolved yet
  - Show "(Tied)" for plays that have multiple winners, instead of listing tied players
- List the most common playmates in the player reports view
- Show play count for each player in the player list

### Refactoring

- Custom implementation of form components instead of MUI:
  - Text/number input fields
  - Select field
  - Checkbox field

## 2022-01-25

### Fixed

- Do not show expansion filtering option in game reports if game definition has defined but empty expansion array

## 2022-01-21

### Added

- Button for shuffling the player seat order when selecting players

### Fixed

- Play results do not show player order if the game uses simultaneous turns

### Refactoring

- Refactored game report play filtering typing
- Refactored typography heading React components
- Minor button component refactoring

## 2022-01-15

### Refactoring

- Internally refactored, renamed and reorganized UI components and database querying

## 2022-01-14

### Fixed

- Fix usage counts for options used multiple times in the same play
- Show loading spinners in different UIs instead of "Loading…" text

## 2022-01-13

### Added

- Allow sorting games by different criteria and show additional stats
- Show loading skeleton on game list view while loading

### Changed

- Format durations property as `<hours>h <minutes>min`

## 2022-01-11

### Added

- Button for starting a new play from the game report view

### Fixed

- Visual improvements to play list winner names

## 2022-01-11

### Added

- Game report view also lists all the plays of that game
- Show winner name(s) on all play lists

## 2022-01-10

### Added

- **Auto-save play while editing**. Show loading spinner while saving is in progress.
- **Immediately upload images on select**. The file input field is now a button (which changes state while upload is in progress). Because of the auto-save, the play is immediately saved after the upload. ![Image upload screenshot](https://bitbucket.org/repo/eyyL58g/images/2741685717-Screenshot%202022-01-10%20at%2021.40.47.png)
- **Show player rankings as emojis** in the play results view
- **Report non-player-specific dimensions** (e.g. generations in Terraforming Mars) ![Non-player-specific dimensions reporting screenshot](https://bitbucket.org/repo/eyyL58g/images/3607138419-Screenshot%202022-01-02%20at%2014.32.44.png)
- Chore: explicitly set tab size to 2 spaces in Prettier configuration
- Chore: Add `lint` script for running ESLint on command line

## 2022-01-09

### Changed

- "Total" to "𝚺" in play view

## 2022-01-02

### Added

- Player's plays to player view
- Recently played games as shortcuts when starting new play

### Removed

- Broken dark mode support

### Fixed

- Start player randomization animation
- Play list load flicker
- Footer buttons layout broken on mobile
- Footer buttons flow to two rows on some mobile phones instead of staying in one row
- Game report view filter expansion selector shows wrong amount of plays for selected expansion

## 2022-12-28

### Changed

- Sticky footer to edit play view

### Fixed

- Start player randomization animation bug
- Prevent starting game with less than two players

### Removed

- Game trend chart

## 2021-12-26

### Changed

- New design using Tailwind CSS

## 2021-08-20

### Changed

- Removed all calculated properties (like date and rankings) from plays. This reduces the size of documents and improves performance.

### Added

- Feature to add images to plays

## 2021-03-30

### Added

- Show game trends as a chart on "Plays" and player report view
- Show "animation" while randomizing starting player for a new play

## 2021-03-02

### Changed

- **Games are stored in the Firestore** instead of being hard-coded. They can be edited in the Admin view, located at `/admin`
- "Reports" is now "Games"

### Added

- New feature: filter game reports by expansions, player counts, and dimensions (e.g. races, factions, corporations)
- Show stats how long players have played games

### Fixed

- Crash in report views when a play has less than 2 players

## 2021-01-23

### Added

- Support for Wingspan
- Support for Clank! In! Space!

## 2020-11-13

### Changed

- Group certain fields on the same view when editing a play.
- Move play edit "Save" button between "Next" and "Previous" buttons
- Minor styling improvements of the play edit form.

### Fixed

- Do not confirm setting the play duration if already set.
- Fixed "Show reports" link button.

## 2020-10-31

### Added

- Reports for single player showing max points, best position, win percentage, trueskill and
  number of plays for each game & for all games

### Fixed

- Issue where navigating between play view and report view was slow due to loading full page

## 2020-10-24

### Added

- Support for Eclipse, for Eclipse: Rise of the Ancients and for Eclipse: Shadow of the Rift

## 2020-10-18

### Added

- Button for randomizing the starting player when selecting players for a new play
- Play again a previous play: use the game and the players from any existing play
- Show play & win counts for best players

## 2020-09-27

### Added

- Remind user to update the game duration when saving play if the play is edited 10 mins - 10 hour after it was created

### Changed

- Sort players by position, not by starting order, in play view

## 2020-09-06

### Changed

- Support for Terraforming Mars expansions

## 2020-09-05

### Fixed

- Issues setting scores with tabulator/enter in plays with expansions

### Changed

- Updated all NPM dependencies

## 2020-08-09

### Added

- Show statistics about each score category for the games:
  - Average scores for the winning players
  - Correlation coefficient with the ranking
- Show correlation coefficient with the ranking and the starting order
- In addition to win/usage percentage, also show the number of wins/usage in game dimension reports

### Changed

- Improved the app bar:
  - "Plays" and "Reports" are now separate top-level navigation pages
  - "Changelog" and "Log out" options can be found in the menu

### Removed

- Removed the ranking vs. winning order chart as it did not provide any statistically meaningful information

## 2020-07-16

### Added

- Support for game expansions. Expansions should no longer be defined as misc fields (with "Variant" in the name),
  but as separate entities that add scoring categories and misc fields to the base game.
- Support for 7 Wonders expansions + Brass Birmingham (as an expansion to Brass)
- Support for Everdell

## 2020-6-22

### Added

- Set play duration from timer feature

## 2020-5-23

### Fixed

- Added Interplanetary cinematics corporation to Terraforming Mars

## 2020-5-16

### Fixed

- Issue where Dominion scores could not be negative

## 2020-5-10

### Fixed

- Fixed the tie breaker. It can now also be any number, not just a fraction, as it won't be added to the normal scores.

### Added

- Feature to report average normalized rank for certain game dimensions, e.g. corporation in Terraforming Mars
- Feature to report win and use percentages for certain game dimensions, e.g. corporation in Terraforming Mars

## 2020-4-11

### Fixed

- Issue where all new plays since 4.4. were replacing the older play resulting in data loss

## 2020-4-4

### Changed

- Updated all NPM dependencies

## 2020-2-22

### Added

- Support for Terraforming Mars: Prelude
- Support for Terraforming Mars: Turmoil
- Link from report view to max/min score plays

## 2020-1-26

### Fixed

- Play list pagination

## 2020-1-25

### Added

- Support for generic game
- Support for Lords of Waterdeep
- Play list pagination

### Fixed

- Misc scores were not shown on play view
- Tie breaker was not shown on play view

## 2019-12-29

### Changed

- Top players list shows 5 players
- Qualification for the top players list requires 3 plays (unless no one has played that many times)

## 2019-12-22

### Changed

- Updated npm libraries

### Fixed

- Catan support

## 2019-12-22

### Added

- Support for Catan

## 2019-10-07

### Removed

- Support for PWA due to caching issues

## 2019-10-03

### Added

- Support for Coup

## 2019-09-29

### Added

- Support for Dominion
- Support for PWA

## 2019-09-22

### Added

- Support winner scores by # of players in report view
- Support for 7 Wonders Armada
- Corporations dimension to Terraforming Mars
- Support for "misc" score fields (e.g. when playing with unsupported expansion)

## 2019-09-21

### Added

- Support for Brass, Imperial & Bohnanza

## 2019-09-18

### Changed

- Switched from ELO rating to TrueSkill to get better player strength estimations

## 2019-09-16

### Added

- Feature to select previously added players easily to new plays
- ELO rating in reports view to find out the most skilled players (based on [SME](http://www.tckerrigan.com/Misc/Multiplayer_Elo/))
- Support for 7 wonders game

### Changed

- Migrated all existing players by removing duplicates and setting same Id for same person

### Fixed

- Equal scores now have equal position

## 2019-09-15

### Changed

- Migrated Caverna: Forgotten folk to be a variant of Caverna

## 2019-08-25

### Added

- Link to reports from play view
- "Colonies" variant to Terraforming Mars

## 2019-08-18

### Added

- Support for Splendor game

## 2019-08-12

### Added

- Simple game reports (min,avg&max winning scores)

### Changed

- Changed PlayView table to be condensed & mobile-friendly

## 2019-08-03

### Added

- Variants (like map, ruleset and add-ons) game fields to Terraforming Mars & to Dominant Species
- Support for "boolean" type game fields
- Support for "affects scoring" property of game fields

### Changed

- Combined Welcome to game's Housing estate 1-6 fields to single Housing estate field
- Minor UI fixes

### Technical

- Updated libraries
- Refactored persisted data model from custom to Firestore's native model
- Renamed game ids to be consistently kebab-cased

## 2019-07-30

### Added

- Added support for resolving ties
- Order plays played on the same date correctly on the play list
- Show CHANGELOG.MD on UI

### Fixed

- Allow inputting empty values
- Minor UI layout fix on play view

## 2019-07-18

### Added

- Support for Dominant Species game

## 2019-06-20

### Added

- Support options for score and misc fields

## 2019-04-19

### Added

- Support for Honshu game

### Fixed

- Minor UX fix: "Select players" => "Add players"

## 2019-03-31

### Added

- Allow play date editing
- Confirm before deleting game
- Support for "value per player" type misc fields for games. Typically misc fields only have 1 value (like "Duration").
  Value per player type is useful for example when storing player race in Caverna.

### Changed

- Better UI design on play list

### Fixed

- Allow setting 0 as score value
- Cannot set negative values to score fields that have minValue == 0
- Cannot set positive values to score fields that have maxValue == 0
- Cannot set non-number values as scores

## 2019-03-30

### Added

- Support for Caverna: Forgotten folk game

## 2019-03-25

### Added

- Initial MVP version. Supports signing in & inputting scores & persisting scores
