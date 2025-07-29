
### App
TeamTango

Backend Supabase and Vercel
Frontend Vue, Tailwind and Capacitor

#### Overview
An app for teams to schedule scrimmages with each other. Focus is on setting availability for their team(s) and being able to discover other teams looking for scrimmages. It is multi sport. And has direct message capabilities between teams.  

### Teams ** near feature complete **
Creates team(s) 
	- Name
	- Logo
	- Sport
	- Age Group
	- Skill Level
	- Phone Number (**must validate its in phone form though still**)
	- City, State/Provice (**must validate its a city so we can get lat/long**)
	- Team Description

### Calendar ** near feature complete **
Enters availability for team(s) ** near feature complete**

### Discovery ** FEATURE COMPLETE **
Searches for matches using filters
	- highly visible filter options are
		- sport (list of sports) 
		- match one of their teams they have (list of their teams to select from) 
		- none (default)
	- default sort order of matches are:
		- sport they have teams in (if other_team_sport = their_team_sport then 1 else 0) descending
		- absolute age difference between thier teams sport (abs(thier_team_age - other_team_age)) ascending
		- proximity difference of latitude and longitude of team cities (lat/long of their team city,state vs lat/long of other team city,state) ascending
		- absolute difference in skill (abs(their_team_skill_num - other_team_skill_num) ascending
		- is disliked (if disliked before 1 else 0) ascending

	- not as visible but can do finer level detail search by:
		- age group
		- proximity to their city,state
		- dates available 
			- to host
			- to travel
		- skill
		- interaction (disliked or liked)
		- team name (fuzzy match)

Scrolls and finds a similar match to toggle like (thumb up) or dislike (thumb down)
	- the like and dislikes toggles are like facebook where you can click on them and see how many ups or downs
	- if user clicks like (show the requests modal)
		- if request were sent and modal filled out ... show "request sent" on card
		- show liked on card and disable clicking again (highlight the thumb up so you can see you liked)
	- if disliked then disable dislike button and show user disliked team
	- user can switch from like or dislike but ask if they are sure first

#### Dashboard ** FEATURE COMPLETE **
There should be tiles with counts for the following PER TEAM:
	- Disliked (count of teams they disliked)
	- Likes (count of teams they've liked + those whom have liked them)
	- Requests (count of requests they've sent + count of requests sent to them)

For all tiles any likes, dislikes, requests should immedietly be updated in thier dashboard. It should highlight if new (hadn't viewed yet)

For all tiles they should be interactive to pull up a modal for:
	- Disliked a modal of all teams they've disliked... the list should contain sport, team name, skill, city st/prov ordered by most recent with a button to toggle off the dislike of team
	- Liked a modal with a list of all the teams they've liked with or whom have liked them.... the list should contain sport, team name, skill, city st/prov with buttons for
		- if match came from other team buttons should be "like"
		- if match came from user then buttons should be "unlike"
	- Requests a modal that is a communication portal between teams... just displays Requests page

### Requests ** FEATURE COMPLETE **
Lightweight communication portal between teams. Much like facebook messanger where direct communiction can happen.
	- List containing sent/request messages with a team. Both teams should be displayed and most recent message (First 100 characters...)
	- Order by most recent
	- User could click a team and then a chat window opens up to either reply or read past messages.
	- messages are just rich text and should look like an iMessage conversation
