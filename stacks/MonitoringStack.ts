import { Metric, TreatMissingData } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { Topic } from "aws-cdk-lib/aws-sns";
import { StackContext } from "sst/constructs";

export const MonitoringStack = ({ stack }: StackContext) => {
    const siriGeneratorNamespace = "SiriGenerator";

    const alarmTopic = new Topic(stack, "cdd-alarm-topic", {
        topicName: `cdd-alarm-topic-${stack.stage}`,
    });

    const siriValidationFailureMetric = new Metric({
        namespace: siriGeneratorNamespace,
        metricName: "SiriValidationFailures",
    });

    const siriPublishSuccessMetric = new Metric({
        namespace: siriGeneratorNamespace,
        metricName: "SiriPublishSuccess",
    });

    const siriValidationAlarm = siriValidationFailureMetric.createAlarm(stack, "cdd-siri-validation-failure-alarm", {
        evaluationPeriods: 1,
        threshold: 1,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        alarmName: `cdd-siri-validation-failure-alarm-${stack.stage}`,
    });

    siriValidationAlarm.addAlarmAction(new SnsAction(alarmTopic));

    return {
        siriGeneratorNamespace,
        siriValidationFailureMetric,
        siriPublishSuccessMetric,
    };
};
