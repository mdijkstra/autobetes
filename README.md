==Readme==

How to run:
1 - Install Xcode with ios simulator
2 - execute platforms/ios/Autobetes.xcodeproj
3 - Project will be loaded into Xcode workspace
4 - Hit run

You can modify in Xcode but Xcode does not compile the application subsequently

To compile:
1 - Install phonegap: http://phonegap.com/install/
2 - Go in the terminal to the project directory
3 - type: phonegap build ios
4 - App is compiled, hit run in Xcode to run

If the data model changes:
1 - Search for comment "Uncomment to drop the tables"
2 - Type in terminal: phonegap build ios
3 - Comment the drop tables code again
4 - phonegap build ios
5 - Stop/run app