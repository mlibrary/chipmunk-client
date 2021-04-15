@ui
Feature: Adding a directory to the workspace
  I have a bunch of artifacts of one type in a directory. I want to add them to
  the workspace so I can track them through packaging and upload.

  In order to process a digital artifact fully
  As a content steward
  I need to track it in the workspace through its deposit lifecycle

  Scenario: Tracking a digital forensics artifact
    Given a directory of floppy disk images that comprise a digital forensics artifact
    When I add the directory to the workspace with content type "Digital Forensics"
    Then the artifact is tracked in the workspace
    And the artifact is ready for packaging