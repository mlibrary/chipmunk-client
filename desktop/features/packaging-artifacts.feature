Feature: Packaging artifacts

  In order to preserve digital artifacts
  As a content steward
  I need to prepare them for deposit

  When it comes down to it, I need to know that I have what I think I
  have. I need to know that the metadata lines up with reality and that
  the files haven't been corrupted.

  It's also useful to know in advance of a deposit that everything is in
  a format that Dark Blue will accept.

  Scenario: Packaging one digital artifact
    Given I have a directory of floppy disc images from a researcher's personal collection
    When I set the content type to "digital"
    And I select that directory for packaging
    And I package the directory
    Then I have the Dark Blue SIP for my artifact

  Scenario: packaging one million videos
  Scenario: packaging a gigantic file
