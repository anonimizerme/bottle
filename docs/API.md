Game Process (WebSocket)
===

Command types:  
---
* @ - from client  
* $ - from server
  
Client commands: 
----------------
1. **@register**
    - Server registers member

3. **@join**
    - Server tries to find suitable room or creates new one
        - suitable room - room with lack of Client's gender
    - Server sends **$room** command
    
4. **@spin**
    - Server chooses random Client with different gender
    - Server sends **$spinResult** command
    
5. **@makeDecision**
    - Server saves information about client decisions
    - If both Clients made decisions Server sends **$makeHost**


Server commands: 
---
1. **$registered** (personal)
    - Command includes success information
2. **$room** (room)
    - Command includes information about room:    
        - room
        - members
    - Client sync local room information with received one
    
3. **$makeHost** (room)
    - Command to set one of the Clients a host. Host can initialize spin of the bottle.
    - Server chooses random Client if there is not host before, or next one
    - Command includes:
        - member id
    - Client set local flag if it's host now
    
4. **$spinResult** (room)
    - Command to set result of the spin
    - Command includes:
        - random member id
    - Client set local paired member id
    
5. **$decision** (room)
    - Command to set result of the Client decisions
    - Command includes:
        - member id
        - decision (yes, no)
    - Client set local information about decision


Workflow:  
---------
**Client start a game**

1. Client connects to Server
2. Client sends command **@register**
3. Server assoc current socket with member
4. Server sends command **$registered**
5. Client receives command **$registered**
6. Client sends command **@join**
7. Server receives **@join** command
8. Server sends **$room** command

**Client spin the bottle**

1. After **@join** another client Server checks if there is more than one Client
2. Server conditions:
    - If only one - break.
    - If host already exists in the room - break.
4. Server sends **$setHost**
5. Clients receive **$setHost**
5. Client conditions:
    - If Client is not host - break
6. Client sends **@spin**
7. Server receives **@spin**
8. Server sends **$spinResult**
9. Clients receive **$spinResult**

**Paired Clients make decision**

1. Clients after receiving **$spinResult**
2. Client conditions:
    - If Client is not host or paired - break
3. Client sends **@makeDecision**
5. Server receives **@makeDecision**
6. Server sends **$decision** 
7. Clients received **$decision**
    