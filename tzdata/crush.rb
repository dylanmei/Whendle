# encoding: utf-8
# example: ruby crush.rb ../etc/tzdata2012b/ ../whendle/tzdata/

class String
  def blank?
    self !~ /\S/
  end
end

def timezone_file?(f)
  if f == "." or f == ".."
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

def strip_right_padding(line)
  line.sub!(/[ \t]*$/, "") unless line.empty?
  line
end

source = ARGV[0]
destination = ARGV[1]

if source.nil?
  puts "usage: crush.rb <source-directory> <destination-directory>"
else
  destination = "." if destination.nil?

  Dir.foreach(source) do |f|
    next unless timezone_file?(f)

    f1 = File.new(File.join(source, f), 'r')
    f2 = File.new(File.join(destination, f), 'w')

    f1.each do |line|
      line = strip_comments(line)
      line = strip_right_padding(line)
      next if line.blank?
      f2.print line
    end

    f1.close
    f2.close
  end
end

