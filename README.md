Below Dion's instructions on 'run', 'compile' and 'upload to TestFairy':

How to run:
- Install Xcode with ios simulator
- execute platforms/ios/Autobetes.xcodeproj
- Project will be loaded into Xcode workspace
- Hit run

You can modify in Xcode but Xcode does not compile the application subsequently

To compile:
- Install phonegap: http://phonegap.com/install/
- Go in the terminal to the project directory
- type: phonegap build ios
- App is compiled, hit run in Xcode to run

# TestFairy
Maak iOS en android projecten via Phonegap
Het doel is om de source code in de www folder om te zetten naar een iOS(.xcode) en Android project. Voor iOS kan daarna het .xcode bestand worden geopend in xcode om vervolgens de app in .ipa formaat te maken.

1) Heb alles geïnstalleerd om met Phonegap te kunnen draaien (zie http://phonegap.com)
2) Installeer alle plugins:
phonegap plugin add org.apache.cordova.statusbar
phonegap local plugin add https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git
phonegap local plugin add org.apache.cordova.inappbrowser
phonegap local plugin add org.apache.cordova.console
cordova plugin add org.apache.cordova.network-information
cordova plugin add https://github.com/testfairy/testfairy-cordova-plugin
cordova plugin add https://github.com/ohh2ahh/AppAvailability.git

Mocht iets fout gaan met 1 of meerdere plugins, dan kan je het geheel resetten door de plugins en platforms directory leeg te maken

Voor android:
3) Zorg ervoor dat de android sdk's platform-tools en tools in je PATH staan:
export PATH=${PATH}:/Development/adt-bundle/sdk/platform-tools:/Development/adt-bundle/sdk/tools
4) phonegap build android
5) In platforms/android/ant-build vind je de Autobetes-debug.apk, deze kun je uploaden naar TestFairy.

Voor iOS:
6) phonegap build iOS

Archiveren IPA
Het doel is om het Xcode project om te zetten naar een IPA, deze IPA kan je vervolgens worden geupload naar Testfairy. Voor de Android APK is diet niet nodig aangezien die al wordt aangemaakt bij phonegap build android. 

1) Open het xcode project: platforms/ios/Autobetes.xcodeproj
2) Zorg ervoor dat het info@diadvies.nl account aan je xcode is gekoppeld (hoeft maar eenmalig). Dit is te vinden bij xcode>preferences>accounts.
3) Zet het target device (links boven) op iOS device.
4) Ga naar Product>Archive
5) Klik 'Export'
6) Klik 'Save for Ad Hoc Deployment' en 'Next'
7) Kies het juiste 'Development Team' certificaat en klik 'choose'
8) Klik 'Export' en geef de gewenste locatie aan.
9) De IPA is nu opgeslagen en klaar om te worden geupload naar TestFairy.

Toevoegen test gebruiker
Het doel is om een test gebruiker bij het Testfairy team te betrekken en deze de iOS en Android app te sturen. We versturen beide, omdat een gebruiker bijvoorbeeld een iOS telefoon heeft en een Android tablet.

1) Voeg tester toe op test fairy: Klik Testers>add testers en vul email en groep(AutobetesTestTeam) in.
2) Verstuur hierna meteen de Android versie, deze kan namelijk meteen door de tester worden geïnstalleerd en gebruikt:
Apps>Autobetes.com>Laatste versie>Distribution>Invite testers by email>Email nieuwe gebruiker > Invite selected tester
3) Als de gebruiker een iOS device heeft dan kan hij deze registreren bij Testfairy via de mail die hij krijgt bij stap 1. Dit registreren is nodig om de UDID te krijgen. Dit UDID is nodig om de users device te koppelen aan het info@diadvies.nl account. Wanneer de gebruiker dit gedaan heeft krijg je van Testfairy een mail met daarin de UDID.
4) Voer dit UDID in bij developer.apple.com/account/ios/device/deviceList.action
5) Na het invoeren dien je de IPA opnieuw te maken(zie SOP archiveren IPA)
6) Upload deze IPA op Testfairy en invite de nieuwe tester.

De tester ontvangt nu een mail met daarin de IPA, hij/zij kan deze nu installeren op zijn telefoon buiten de App Store om, omdat de UDID is gekoppeld aan ons account
