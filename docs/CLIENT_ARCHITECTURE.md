Client Architecture
===================

Starting the Game:
------------------
1. Load all assets
2. Connect to Server
3. Join to game and get information about the Room
4. Load members photos
5. Render the Room

Game process:
-------------
1. Show message that waiting your turn
2. Get makeHost command
   - Mark player host
3. If own step
   - Show button to spin the bottle
   - Send spin command
   - Start to revolve the bottle
4. Get spinResult
   - Count end angle and add some degrees
   - Wait while bottle is stopped
5. Show popup with two players
6. If own step
   - Show decision button
   - Send makeDecision command
7. Get decision result
   - Make changes on popup
   - If there is two decision
     - timeout and hide popup


Game components:
----------------
1. Members
2. Bottle
3. Popup decision
    