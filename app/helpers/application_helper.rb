module ApplicationHelper
  def external_javascript
    jsincludes = []
    jsincludes << "https://www.google.com/jsapi?autoload={'modules':[{'name':'visualization','version':'1'}]}"

    if (true == Rails.env.production?())
      jsincludes << "http://code.jquery.com/jquery-2.0.2.min.js"
      jsincludes << "http://code.jquery.com/ui/1.10.3/jquery-ui.min.js"
      #jsincludes << "http://www.appelsiini.net/download/jquery.jeditable.mini.js"
      jsincludes << "http://underscorejs.org/underscore-min.js"
      jsincludes << "http://backbonejs.org/backbone-min.js"
    else
      jsincludes << "http://code.jquery.com/jquery-2.0.2.js"
      jsincludes << "http://code.jquery.com/ui/1.10.3/jquery-ui.js"
      #jsincludes << "http://www.appelsiini.net/download/jquery.jeditable.js"
      jsincludes << "http://underscorejs.org/underscore.js"
      jsincludes << "http://backbonejs.org/backbone.js"
      jsincludes << "http://www.appelsiini.net/download/jquery.jeditable.mini.js"
      #jsincludes << "https://raw.github.com/PaulUithol/Backbone-relational/0.8.5/backbone-relational.js"
    end

    return jsincludes
  end
end
