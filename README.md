# Devcycle Lambda Example (Node.js)
This is an example of how to create, deploy, and run an AWS Lambda function that makes use of the Devcycle NodeJS server SDK.

The project source includes function code and supporting resources:

- `function` - A Node.js function.
- `template.yml` - An AWS CloudFormation template that creates an application.
- `1-create-bucket.sh`, `2-deploy.sh`, etc. - Shell scripts that use the AWS CLI to deploy and manage the application.

Use the following instructions to setup devcycle, and then deploy the sample application. 
In this example, we will be dynamically changing the `type` field of an event based on the value of a devcycle variable called `event-type`.

Note: You must be using node 14 for the lambda function, as the Devcycle Node SDK is incompatible with earlier versions.
# Steps on Using DevCycle sdk
DevCycle NodeJS Server SDK is used in this example
https://docs.devcycle.com/docs/sdk/server-side-sdks/node
## Sign Up for DevCycle
- Go to https://devcycle.com/ and click "Create Account" on your top right corner
## Environments
- After login, go to Settings > Environments & Keys
- By Default, you will have 3 environments (Development, Staging, Production)
- Sdk keys are provided on this page
- In this example, we are using Server key, copy your server key to `SERVER_TOKEN` in your `DVC.initialize` call(For more details, https://docs.devcycle.com/docs/home/feature-management/organizing-your-flags-and-variables/api-and-sdk-keys)
## Create Feature and Variable
1. Click "Feature Management" on the top nav bar
2. Click "Create New Feature", choose "Release" type
3. Type `event-type` as the name and the key should be auto filled (make sure your key is also `event-type`)
4. Click "Create Feature", and your feature should be created (your feature is also a variable)
5. Remove the default variable by clicking the edit button next to "lambda-example" on the "Remote Variables" table and click "Delete"
6. Click "Add Variable"
    - type `event-type` for Variable Key
    - choose String for Variable Type
    - type "my-new-event" for Variation On
    - type "my-event" for Variation Off
    - click "Add Variable"
7. Scroll down to users and targeting for whichever environment's server key you selected
8. Change the targeting definition to say: User ID is test_1
7. Click "Save"
# Lambda Setup
Download or clone this repository.

    $ git clone https://github.com/DevCycleHQ/devcycle-lambda-example.git
    $ cd devcycle-lambda-example

To create a new bucket for deployment artifacts, run `1-create-bucket.sh`.

    devcycle-lambda-example$ ./1-create-bucket.sh
    make_bucket: devcycle-lambda-example-940d87e83ef56f53

To build a Lambda layer that contains the function's runtime dependencies, run `2-build-layer.sh`. Packaging dependencies in a layer reduces the size of the deployment package that you upload when you modify your code.

    devcycle-lambda-example$ ./2-build-layer.sh

# Deploy
To deploy the application, run `3-deploy.sh`.

    devcycle-lambda-example$ ./3-deploy.sh
    added 16 packages from 18 contributors and audited 18 packages in 0.926s
    added 17 packages from 19 contributors and audited 19 packages in 0.916s
    Uploading to e678bc216e6a0d510d661ca9ae2fd941  2737254 / 2737254.0  (100.00%)
    Successfully packaged artifacts and wrote output template to file out.yml.
    Waiting for changeset to be created..
    Waiting for stack create/update to complete
    Successfully created/updated stack - devcycle-lambda-example

This script uses AWS CloudFormation to deploy the Lambda functions and an IAM role. If the AWS CloudFormation stack that contains the resources already exists, the script updates it with any changes to the template or function code.

# Test
To invoke the function, run `4-invoke.sh`.

    devcycle-lambda-example$ ./4-invoke.sh
    {
        "StatusCode": 200,
        "ExecutedVersion": "$LATEST"
    }
    [{"user_id":"test_1","clientDate":"2022-04-29T14:18:01Z","target":"my_target","featureVars":{},"metaData":{"key":"value","example":123},"type":"my-new-event","value":3},{"user_id":"test_2","clientDate":"2022-04-29T14:18:01Z","target":"my_target","featureVars":{},"metaData":{"key":"value","example":17},"type":"my_event","value":60}]

The output should show two events. The first event is for the user with `user_id: test_1`. This event should have its type changed to `my-new-event`, as the user_id matches the targeting rule, resulting in the variation being ON.
Let the script invoke the function a few times and then press `CRTL+C` to exit.

Finally, view the application in the Lambda console.

*To view the application*
1. Open the [applications page](https://console.aws.amazon.com/lambda/home#/applications) in the Lambda console.
2. Choose **devcycle-lambda-example-function-XXXXXXXXX**.


# Cleanup
To delete the application, run `5-cleanup.sh`.

    devcycle-lambda-example$ ./5-cleanup.sh
    Deleted devcycle-lambda-example stack.
    Delete deployment artifacts and bucket (lambda-artifacts-4475xmpl08ba7f8d)?y
    delete: s3://devcycle-lambda-example-940d87e83ef56f53/6f2edcce52085e31a4a5ba823dba2c9d
    delete: s3://devcycle-lambda-example-940d87e83ef56f53/3d3aee62473d249d039d2d7a37512db3
    remove_bucket: devcycle-lambda-example-940d87e83ef56f53
    Delete function logs? (log group /aws/lambda/devcycle-lambda-example-function-1RQTXMPLR0YSO)y

The cleanup script deletes the application stack, which includes the function and execution role, and local build artifacts. You can choose to delete the bucket and function logs as well.
