# encoding: utf-8

class String
  def blank?
    self !~ /\S/
  end
end

def timezone_file?(f)
  if f =~ /^\./ || File.directory?(f)
    false
  else
    File.extname(f).empty?
  end
end

def strip_comments(line)
  line = "" unless line.valid_encoding?
  line.sub!(/#.*$/, "") unless line.empty?
  line
end

source = ARGV[0]
destination = ARGV[1]

if source.nil?
  puts "usage: specs.rb <source-directory> <destination-directory>"
else
  destination = "." if destination.nil?
  script = File.new(File.join(destination, 'tzdata.json'), 'w')
  script.puts <<WRAP
var TZ = {
	"names": [
WRAP
  comma = false
  Dir.foreach(source) do |f|
    next unless timezone_file?(f)

    f1 = File.new(File.join(source, f), 'r')
    f1.each do |l|
      line = strip_comments l
      next if line.blank?

      match = /Zone(?:\s+(\w+\/[\w-]+\/?[\w-]*))/.match(l)
      next unless match

      script.puts comma ? %{,"#{match[1]}"} : %{ "#{match[1]}"}
      comma = true
    end

    f1.close
  end

  script.puts <<UNWRAP
  ]
};
UNWRAP
  script.close
end

