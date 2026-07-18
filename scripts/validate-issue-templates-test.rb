#!/usr/bin/env ruby
# frozen_string_literal: true

require "fileutils"
require "minitest/autorun"
require "tmpdir"
require "yaml"

require_relative "validate-issue-templates"

class IssueTemplateValidatorTest < Minitest::Test
  REPOSITORY_ROOT = File.expand_path("..", __dir__)
  TEMPLATE_SOURCE = File.join(REPOSITORY_ROOT, ".github", "ISSUE_TEMPLATE")

  def test_repository_templates_are_valid
    assert_empty IssueTemplateValidator.validate(REPOSITORY_ROOT)
  end

  def test_malformed_yaml_is_rejected
    with_template_copy do |root|
      File.write(template_path(root, "bug_report.yml"), "name: [\n")

      errors = IssueTemplateValidator.validate(root)
      assert errors.any? { |error| error.include?("bug_report.yml: invalid YAML") }, errors.join("\n")
    end
  end

  def test_duplicate_field_ids_are_rejected
    with_template_copy do |root|
      path = template_path(root, "ui_bug.yml")
      document = YAML.safe_load(File.read(path), permitted_classes: [], permitted_symbols: [], aliases: false)
      source = document.fetch("body").find { |item| item["id"] == "component" }
      duplicate = Marshal.load(Marshal.dump(source))
      document.fetch("body") << duplicate
      File.write(path, YAML.dump(document))

      errors = IssueTemplateValidator.validate(root)
      assert errors.any? { |error| error.include?('duplicate field id "component"') }, errors.join("\n")
    end
  end

  def test_missing_checkbox_options_is_reported_without_crashing
    with_template_copy do |root|
      path = template_path(root, "bug_report.yml")
      document = YAML.safe_load(File.read(path), permitted_classes: [], permitted_symbols: [], aliases: false)
      checkbox = document.fetch("body").find { |item| item["type"] == "checkboxes" }
      checkbox.fetch("attributes").delete("options")
      File.write(path, YAML.dump(document))

      errors = IssueTemplateValidator.validate(root)
      assert errors.any? { |error| error.include?("attributes.options must be a non-empty array") }, errors.join("\n")
    end
  end

  private

  def with_template_copy
    Dir.mktmpdir do |root|
      destination = File.join(root, ".github", "ISSUE_TEMPLATE")
      FileUtils.mkdir_p(File.dirname(destination))
      FileUtils.cp_r(TEMPLATE_SOURCE, destination)
      yield root
    end
  end

  def template_path(root, filename)
    File.join(root, ".github", "ISSUE_TEMPLATE", filename)
  end
end
