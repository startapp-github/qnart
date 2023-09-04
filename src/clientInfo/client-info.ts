export const appSolutionInfo: any = {
  clientId: 'htc95q0OO2CYRjNlhWjd',
  chatSwitch: false,
  communitySwitch: true,
  mallSwitch: false,
  sampleSwitch: false,
  projectType: 'community',
  title: 'KN커채몰',
  storageBucket: 'kn-community-mall.appspot.com',
  oneSignalAppId: '41cf35f7-97e0-421d-8d0d-14415722f68c',
  android_channel_id: '83cf30e5-9555-41d5-bec1-a89c08fab451',
  import_USER_CODE: 'imp82532117',
};

if (appSolutionInfo.sampleSwitch) {
  appSolutionInfo.projectType = '';
  appSolutionInfo.title = '';
  appSolutionInfo.storageBucket = '';
}
