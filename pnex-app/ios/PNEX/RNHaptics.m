#import <React/RCTBridgeModule.h>

@interface RNHaptics : NSObject <RCTBridgeModule>
@end

@implementation RNHaptics

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(impactHeavy)
{
  UIImpactFeedbackGenerator *gen = [[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleHeavy];
  [gen prepare];
  [gen impactOccurred];
}

RCT_EXPORT_METHOD(impactLight)
{
  UIImpactFeedbackGenerator *gen = [[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleLight];
  [gen prepare];
  [gen impactOccurred];
}

RCT_EXPORT_METHOD(impactMedium)
{
  UIImpactFeedbackGenerator *gen = [[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleMedium];
  [gen prepare];
  [gen impactOccurred];
}

RCT_EXPORT_METHOD(notificationSuccess)
{
  UINotificationFeedbackGenerator *gen = [[UINotificationFeedbackGenerator alloc] init];
  [gen prepare];
  [gen notificationOccurred:UINotificationFeedbackTypeSuccess];
}

RCT_EXPORT_METHOD(notificationError)
{
  UINotificationFeedbackGenerator *gen = [[UINotificationFeedbackGenerator alloc] init];
  [gen prepare];
  [gen notificationOccurred:UINotificationFeedbackTypeError];
}

RCT_EXPORT_METHOD(notificationWarning)
{
  UINotificationFeedbackGenerator *gen = [[UINotificationFeedbackGenerator alloc] init];
  [gen prepare];
  [gen notificationOccurred:UINotificationFeedbackTypeWarning];
}

RCT_EXPORT_METHOD(selectionChanged)
{
  UISelectionFeedbackGenerator *gen = [[UISelectionFeedbackGenerator alloc] init];
  [gen prepare];
  [gen selectionChanged];
}

@end
