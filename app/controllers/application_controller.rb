class ApplicationController < ActionController::Base
  protect_from_forgery
end

module JSONNoDates
  def as_json(options = nil)
    options ||= {}
    options[:except] ||= []
    options[:except] << :updated_at
    options[:except] << :created_at
    return super.as_json(options)
  end
end
