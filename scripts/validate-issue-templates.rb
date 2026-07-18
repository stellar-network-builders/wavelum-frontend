#!/usr/bin/env ruby
# frozen_string_literal: true

require "uri"
require "yaml"

module IssueTemplateValidator
  TEMPLATE_DIR = File.join(".github", "ISSUE_TEMPLATE")
  FORM_FILES = %w[bug_report.yml feature_request.yml ui_bug.yml].freeze
  CONFIG_FILE = "config.yml"
  FIELD_TYPES = %w[input textarea dropdown checkboxes].freeze
  BODY_TYPES = (["markdown"] + FIELD_TYPES).freeze
  REQUIRED_FIELDS = {
    "bug_report.yml" => %w[description steps expected actual browser operating_system],
    "feature_request.yml" => %w[problem proposed_solution alternatives],
    "ui_bug.yml" => %w[component screen_size browser steps expected actual]
  }.freeze

  module_function

  def validate(root = Dir.pwd)
    errors = []
    FORM_FILES.each do |filename|
      path = File.join(root, TEMPLATE_DIR, filename)
      document = load_yaml(path, filename, errors)
      validate_form(document, filename, errors) if document
    end

    config_path = File.join(root, TEMPLATE_DIR, CONFIG_FILE)
    config = load_yaml(config_path, CONFIG_FILE, errors)
    validate_config(config, errors) if config
    errors
  end

  def load_yaml(path, filename, errors)
    unless File.file?(path)
      errors << "#{filename}: file is missing"
      return nil
    end

    YAML.safe_load(
      File.read(path),
      permitted_classes: [],
      permitted_symbols: [],
      aliases: false
    )
  rescue Psych::Exception => error
    errors << "#{filename}: invalid YAML (#{error.message.lines.first.strip})"
    nil
  end

  def validate_form(form, filename, errors)
    unless form.is_a?(Hash)
      errors << "#{filename}: root must be a mapping"
      return
    end

    require_string(form, "name", filename, errors)
    require_string(form, "description", filename, errors)
    optional_string(form, "title", filename, errors)
    optional_string_array(form, "labels", filename, errors)
    optional_string_array(form, "assignees", filename, errors)

    body = form["body"]
    unless body.is_a?(Array) && !body.empty?
      errors << "#{filename}: body must be a non-empty array"
      return
    end

    ids = []
    required_fields = 0
    optional_fields = 0

    body.each_with_index do |item, index|
      location = "#{filename}: body[#{index}]"
      unless item.is_a?(Hash)
        errors << "#{location} must be a mapping"
        next
      end

      type = item["type"]
      unless BODY_TYPES.include?(type)
        errors << "#{location}.type must be one of #{BODY_TYPES.join(', ')}"
        next
      end

      attributes = item["attributes"]
      unless attributes.is_a?(Hash)
        errors << "#{location}.attributes must be a mapping"
        next
      end

      if type == "markdown"
        require_string(attributes, "value", "#{location}.attributes", errors)
        next
      end

      id = item["id"]
      if !id.is_a?(String) || id !~ /\A[a-zA-Z0-9_-]+\z/
        errors << "#{location}.id must use letters, numbers, hyphens, or underscores"
      elsif ids.include?(id)
        errors << "#{filename}: duplicate field id #{id.inspect}"
      else
        ids << id
      end

      require_string(attributes, "label", "#{location}.attributes", errors)
      validate_options(attributes["options"], type, location, errors)
      validate_validations(item["validations"], location, errors)

      if required_item?(item, type)
        required_fields += 1
      else
        optional_fields += 1
      end
    end

    errors << "#{filename}: include at least one required field" if required_fields.zero?
    errors << "#{filename}: include at least one optional field" if optional_fields.zero?

    REQUIRED_FIELDS.fetch(filename).each do |id|
      errors << "#{filename}: missing required field id #{id.inspect}" unless ids.include?(id)
    end
  end

  def validate_config(config, errors)
    unless config.is_a?(Hash)
      errors << "#{CONFIG_FILE}: root must be a mapping"
      return
    end

    blank_issues = config["blank_issues_enabled"]
    unless blank_issues == true || blank_issues == false
      errors << "#{CONFIG_FILE}: blank_issues_enabled must be true or false"
    end

    links = config["contact_links"]
    unless links.is_a?(Array)
      errors << "#{CONFIG_FILE}: contact_links must be an array"
      return
    end

    links.each_with_index do |link, index|
      location = "#{CONFIG_FILE}: contact_links[#{index}]"
      unless link.is_a?(Hash)
        errors << "#{location} must be a mapping"
        next
      end

      require_string(link, "name", location, errors)
      require_string(link, "about", location, errors)
      require_https_url(link["url"], location, errors)
    end
  end

  def validate_options(options, type, location, errors)
    return unless %w[dropdown checkboxes].include?(type)

    unless options.is_a?(Array) && !options.empty?
      errors << "#{location}.attributes.options must be a non-empty array"
      return
    end

    if type == "dropdown"
      unless options.all? { |option| option.is_a?(String) && !option.strip.empty? }
        errors << "#{location}.attributes.options must contain non-empty strings"
      end
      return
    end

    options.each_with_index do |option, index|
      option_location = "#{location}.attributes.options[#{index}]"
      unless option.is_a?(Hash)
        errors << "#{option_location} must be a mapping"
        next
      end

      require_string(option, "label", option_location, errors)
      next unless option.key?("required")

      required = option["required"]
      errors << "#{option_location}.required must be true or false" unless required == true || required == false
    end
  end

  def validate_validations(validations, location, errors)
    return if validations.nil?

    unless validations.is_a?(Hash)
      errors << "#{location}.validations must be a mapping"
      return
    end

    return unless validations.key?("required")

    required = validations["required"]
    errors << "#{location}.validations.required must be true or false" unless required == true || required == false
  end

  def required_item?(item, type)
    return true if item.dig("validations", "required") == true
    return false unless type == "checkboxes"

    options = item.dig("attributes", "options")
    return false unless options.is_a?(Array)

    options.any? do |option|
      option.is_a?(Hash) && option["required"] == true
    end
  end

  def require_string(mapping, key, location, errors)
    value = mapping[key]
    return if value.is_a?(String) && !value.strip.empty?

    errors << "#{location}.#{key} must be a non-empty string"
  end

  def optional_string(mapping, key, location, errors)
    return unless mapping.key?(key)

    value = mapping[key]
    errors << "#{location}.#{key} must be a string" unless value.is_a?(String)
  end

  def optional_string_array(mapping, key, location, errors)
    return unless mapping.key?(key)

    values = mapping[key]
    valid = values.is_a?(Array) && values.all? { |value| value.is_a?(String) && !value.strip.empty? }
    errors << "#{location}.#{key} must be an array of non-empty strings" unless valid
  end

  def require_https_url(value, location, errors)
    uri = URI.parse(value.to_s)
    return if uri.is_a?(URI::HTTPS) && uri.host

    errors << "#{location}.url must be an absolute HTTPS URL"
  rescue URI::InvalidURIError
    errors << "#{location}.url must be an absolute HTTPS URL"
  end
end

if $PROGRAM_NAME == __FILE__
  errors = IssueTemplateValidator.validate
  if errors.empty?
    puts "Validated #{IssueTemplateValidator::FORM_FILES.length} issue forms and config.yml"
  else
    warn errors.map { |error| "- #{error}" }.join("\n")
    exit 1
  end
end
